/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Handlebars from '../helpers/handlebars'
import fs from 'fs-extra'
import path from 'path'
import prettier from 'prettier'
import stripIndent from 'strip-indent'

import { interpreters as commonInterpreters } from '../common'
import { Interpreter, Context } from '../interpreter'
import { Command } from '../command'
import { DocumentNode } from '../../ast'
import { Data } from '../data'

export const interpreters: Record<string, Interpreter> = {
  ...commonInterpreters,

  _renderDocument: commonInterpreters.renderDocument,

  renderDocument: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as DocumentNode

      const collection: Data[] = []
      const asyncIter = context.dispatch({
        name: '_renderDocument',
        node,
      })

      for await (const data of asyncIter) {
        collection.push(data)
      }

      const metadata = collection
        .filter((data) => data.name === 'metadata')
        .map((data) => data.metadata)
        .reduce(
          (prevMetadata, metadata) => ({
            ...prevMetadata,
            ...metadata,
          }),
          {}
        )

      const content = collection
        .filter((data) => data.name === 'html')
        .map((data) => data.content)
        .join('')

      const template = Handlebars.compile(
        stripIndent(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>{{ metadata.title }}</title>
            </head>
            <body>
              {{{ data.content }}}

              <script src="./bundle.js"></script>
            </body>
          </html>
        `)
      )

      const rendered = template({
        metadata: {
          ...metadata,
          title: metadata.title || 'PostText',
        },
        data: {
          content,
        },
      })

      yield* context.dispatch({
        name: 'writeFile',
        file: 'index.html',
        content: prettier.format(rendered, { parser: 'html' }),
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
