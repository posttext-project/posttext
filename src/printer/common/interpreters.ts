/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import Handlebars from '../helpers/handlebars'
import { v4 as uuidv4 } from 'uuid'

import { Interpreter, Context } from '../interpreter'
import { TagNode, DocumentNode, TextNode, Node } from '../ast'
import { Command } from '../command'
import { Data } from '../data'

const TAG_STATE = Symbol('TagState')
const SEND_RECEIVE = Symbol('SendReceive')

export const interpreters: Record<string, Interpreter> = {
  preload: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as
        | DocumentNode
        | TagNode
        | TextNode

      switch (node.type) {
        case 'Document': {
          return yield* context.dispatch({
            name: 'preloadDocument',
            node,
          })
        }

        case 'Tag': {
          return yield* context.dispatch({
            name: 'preloadTag',
            node,
          })
        }
      }
    },
  },

  preloadDocument: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as DocumentNode

      for (const childNode of node.body) {
        if (childNode.type === 'Tag') {
          yield* context.dispatch({
            name: 'preload',
            node: childNode,
          })
        }
      }
    },
  },

  preloadTag: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as TagNode

      const resolver = context.registry.getTagResolver(
        node.id.name
      )

      if (!resolver) {
        return yield* context.dispatch({
          name: 'preloadChildTags',
          node,
        })
      }

      const iter = resolver.preload?.()

      if (!iter) {
        return yield* context.dispatch({
          name: 'preloadChildTags',
          node,
        })
      }

      let iterResult = await iter.next()
      resolverLoop: while (!iterResult.done) {
        const resolverCommand = {
          ...iterResult.value,
          node,
        }

        const interpreter = context.interpreters.get(
          resolverCommand.name
        )

        if (
          !interpreter ||
          interpreter.modifier === 'private'
        ) {
          break
        }

        const commandIter = context.dispatch(resolverCommand)

        let commandIterResult = await commandIter.next()
        while (!commandIterResult.done) {
          if (commandIterResult.value.name === 'break') {
            break resolverLoop
          }

          yield commandIterResult.value

          commandIterResult = await commandIter.next()
        }

        iterResult = await iter.next(commandIterResult.value)
      }

      return yield* context.dispatch({
        name: 'preloadChildTags',
        node,
      })
    },
  },

  preloadChildTags: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode

      for (const block of tagNode.blocks) {
        for (const childNode of block.body) {
          if (childNode.type === 'Tag') {
            yield* context.dispatch({
              name: 'preloadTag',
              node: childNode,
            })
          }
        }
      }
    },
  },

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
            name: 'renderDocument',
            node,
          })
        }

        case 'Tag': {
          return yield* context.dispatch({
            name: 'renderTag',
            node,
          })
        }

        case 'Text': {
          return yield* context.dispatch({
            name: 'renderText',
            node,
          })
        }

        case 'Block': {
          return yield* context.dispatch({
            name: 'renderBlock',
            node,
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

      const resolver = context.registry.getTagResolver(
        node.id.name
      )

      if (!resolver) {
        return
      }

      const iter = resolver.resolve()
      let iterResult = await iter.next()
      resolverLoop: while (!iterResult.done) {
        const resolverCommand = {
          ...iterResult.value,
          node,
        }

        const interpreter = context.interpreters.get(
          resolverCommand.name
        )

        if (
          !interpreter ||
          interpreter.modifier === 'private'
        ) {
          break
        }

        const commandIter = context.dispatch(resolverCommand)

        let commandIterResult = await commandIter.next()
        while (!commandIterResult.done) {
          if (commandIterResult.value.name === 'break') {
            break resolverLoop
          }

          yield commandIterResult.value

          commandIterResult = await commandIter.next()
        }

        iterResult = await iter.next(commandIterResult.value)
      }
    },
  },

  renderText: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const textNode = command.node as TextNode

      yield {
        name: 'html',
        type: 'inline',
        content: textNode.value,
      }
    },
  },

  getState: {
    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as TagNode

      const state = context.getState(TAG_STATE)
      if (!state[node.id.name]) {
        state[node.id.name] = {}
      }

      return state[node.id.name]
    },
  },

  getParams: {
    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode

      return tagNode.params.map((param) => param.value)
    },
  },

  getAttrs: {
    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode

      return tagNode.attrs
        .filter((attr) => attr.id.name.indexOf(':') === -1)
        .reduce(
          (attrs, currAttr) => ({
            ...attrs,
            [currAttr.id.name]: currAttr.value,
          }),
          {}
        )
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
      if (!block) {
        return
      }

      const renderedChildNodes: string[] = []
      for (const childNode of block.body) {
        for await (const data of context.dispatch({
          name: 'render',
          node: childNode,
        })) {
          if (data.name === 'html') {
            const content = data.content

            renderedChildNodes.push(content)
          }
        }
      }

      return renderedChildNodes.join('')
    },
  },

  getBlockChildNodes: {
    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode
      const index = command.index ?? 0

      const displayMode = command.displayMode as boolean

      const block = tagNode.blocks[index]
      if (!block) {
        return
      }

      if (block.body.length === 0) {
        return []
      }

      const firstChild = block.body[0]
      const childNodes =
        firstChild.type !== 'Text'
          ? [
              {
                type: 'Text',
                value: '',
              },
              ...block.body,
            ]
          : block.body

      const renderedChildNodes: string[] = []

      if (displayMode) {
        let currentNodeIsInline = true
        let renderedChunk: string[] = []

        for (const childNode of childNodes) {
          for await (const data of context.dispatch({
            name: 'render',
            node: childNode,
          })) {
            if (data.name === 'html') {
              if (
                currentNodeIsInline ===
                ((data.type as string | undefined) === 'inline')
              ) {
                const content = data.content as string

                renderedChunk.push(content)
              } else {
                renderedChildNodes.push(renderedChunk.join(''))
                currentNodeIsInline = !currentNodeIsInline

                const content = data.content as string

                renderedChunk = [content]
              }
            }
          }
        }

        renderedChildNodes.push(renderedChunk.join(''))

        return renderedChildNodes
      } else {
        for (const childNode of childNodes) {
          const renderedChildNode: string[] = []

          for await (const data of context.dispatch({
            name: 'render',
            node: childNode,
          })) {
            if (data.name === 'html') {
              const content = data.content

              renderedChildNode.push(content)
            }
          }

          renderedChildNodes.push(renderedChildNode.join(''))
        }
      }

      return renderedChildNodes
    },
  },

  textContent: {
    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode
      const index = command.index ?? 0

      const block = tagNode.blocks[index]
      if (!block) {
        return
      }

      return block.body
        .filter((node) => node.type === 'Text')
        .map((textNode: TextNode) => textNode.value)
        .join('')
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
      const type = command.type as string | undefined

      const rendered = template({ data })

      yield {
        name: 'html',
        type,
        content: rendered,
      }
    },
  },

  metadata: {
    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const metadata = command.metadata as Record<
        string,
        string
      >

      yield {
        name: 'metadata',
        metadata,
      }
    },
  },

  send: {
    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as TagNode
      const symbol = command.symbol as symbol

      const data = command.data

      if (!node.__metadata.send) {
        node.__metadata.send = {}
      }

      if (!node.__metadata.send[symbol]) {
        node.__metadata.send[symbol] = []
      }

      node.__metadata.send[symbol].push(data)

      const state = context.getState(SEND_RECEIVE) as any

      if (!state[symbol]) {
        state[symbol] = []
      }

      state[symbol].push(data)
    },
  },

  receive: {
    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const symbol = command.symbol as symbol

      const state = context.getState(SEND_RECEIVE) as any

      return state[symbol]?.slice?.() ?? []
    },
  },

  uuid: {
    interpret: async function* (
      _command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      return uuidv4()
    },
  },
}
