import { Interpreter, Dispatch } from '../interpreter'
import { TagNode } from '../../ast'
import { Command } from '../command'

import Handlebars from 'handlebars'

export const interpreters: Record<string, Interpreter> = {
  getParams: {
    interpret: async function* (
      tagNode: TagNode
    ): AsyncGenerator<Command, any, any> {
      return tagNode.params
    },
  },

  blockCount: {
    interpret: async function* (
      tagNode: TagNode
    ): AsyncGenerator<Command, any, any> {
      return tagNode.blocks.length
    },
  },

  getBlock: {
    interpret: async function* (
      tagNode: TagNode,
      command: Command,
      dispatch: Dispatch
    ): AsyncGenerator<Command, any, any> {
      const index = command.index ?? 0

      const block = tagNode.blocks[index]

      const renderedChildNodes: string[] = []
      for (const childNode of block.body) {
        for await (const command of dispatch(childNode, {
          name: 'render',
        })) {
          if (command.name === 'data') {
            const { rendered } = command.data

            renderedChildNodes.push(rendered)
          }
        }
      }

      yield {
        name: 'data',
        data: { rendered: renderedChildNodes.join('') },
      }
    },
  },

  html: {
    interpret: async function* (
      tagNode: TagNode,
      command: Command
    ): AsyncGenerator<Command, any, any> {
      const template = Handlebars.compile(
        command.template ?? ''
      )
      const data = command.data ?? {}

      const rendered = template({ data })

      yield {
        name: 'data',
        data: { rendered },
      }
    },
  },
}
