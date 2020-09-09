import Handlebars from 'handlebars'
import fs from 'fs-extra'
import path from 'path'

import { interpreters as commonInterpreters } from '../common'
import { Interpreter, Context } from '../interpreter'
import { Command } from '../command'
import { DocumentNode } from '../../ast'
import { Data } from '../data'

export const interpreters: Record<string, Interpreter> = {
  ...commonInterpreters,

  renderDocument: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as DocumentNode

      const collection: Data[] = []
      for (const childNode of node.body) {
        const asyncIter = context.dispatch({
          name: 'render',
          node: childNode,
        })

        for await (const data of asyncIter) {
          collection.push(data)
        }
      }

      const content = collection
        .filter((data) => data.name === 'html')
        .map((data) => data.content)
        .join('')

      const template = Handlebars.compile(`
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>
          </head>
          <body>
            {{{ content }}}
          </body>
        </html>
      `)

      const rendered = template({
        content,
      })

      yield* context.dispatch({
        name: 'writeFile',
        file: 'index.html',
        content: rendered,
      })
    },
  },

  writeFile: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const file = command.file as string
      const content = command.content as string

      const filePath = path.resolve('dist', file)

      await fs.ensureFile(filePath)
      await fs.writeFile(filePath, content)
    },
  },
}
