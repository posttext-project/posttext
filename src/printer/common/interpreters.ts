import Handlebars from 'handlebars'

import { Interpreter, Context } from '../interpreter'
import { TagNode, Node, DocumentNode } from '../../ast'
import { Command } from '../command'
import { Data } from '../data'

export const interpreters: Record<string, Interpreter> = {
  render: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as Node

      switch (node.type) {
        case 'Document': {
          return yield* context.dispatch({
            ...command,
            name: 'renderDocument',
          })
        }

        case 'Tag': {
          return yield* context.dispatch({
            ...command,
            name: 'renderTag',
          })
        }

        case 'Text': {
          return yield* context.dispatch({
            ...command,
            name: 'renderText',
          })
        }

        case 'Block': {
          return yield* context.dispatch({
            ...command,
            name: 'renderBlock',
          })
        }
      }
    },
  },

  renderDocument: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as DocumentNode

      for (const childNode of node.body) {
        yield* context.dispatch({
          name: 'render',
          node: childNode,
        })
      }
    },
  },

  renderTag: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as TagNode

      const resolver = this.registry.getTagResolver(
        node.id.name
      )

      if (!resolver) {
        return
      }

      const iter = resolver.resolve()
      let iterResult = await iter.next()
      resolverLoop: while (!iterResult.done) {
        const resolverCommand = iterResult.value

        const interpreter = this.interpreters.get(
          resolverCommand.name
        )

        if (
          !interpreter ||
          interpreter.modifier === 'private'
        ) {
          break
        }

        const commandIter = context.dispatch(resolverCommand)

        const commandIterResult = await commandIter.next()
        while (!commandIterResult.done) {
          if (commandIterResult.value.name === 'error') {
            break resolverLoop
          }

          yield commandIterResult.value
        }

        iterResult = await iter.next(commandIterResult.value)
      }
    },
  },

  getParams: {
    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode

      return tagNode.params
    },
  },

  blockCount: {
    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode

      return tagNode.blocks.length
    },
  },

  getBlock: {
    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode
      const index = command.index ?? 0

      const block = tagNode.blocks[index]

      const renderedChildNodes: string[] = []
      for (const childNode of block.body) {
        for await (const data of context.dispatch({
          name: 'render',
          node: childNode,
        })) {
          if (data.name === 'data') {
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
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
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
