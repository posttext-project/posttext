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
    },
  },
}
