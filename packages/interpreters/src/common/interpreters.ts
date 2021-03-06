/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { v4 as uuidv4 } from 'uuid'
import {
  Command,
  Data,
  Interpreter,
  Context,
} from '@posttext/registry'
import {
  DocumentNode,
  BlockNode,
  TagNode,
  TextNode,
  Node,
} from '@posttext/parser'

import Handlebars from '../helpers/handlebars.js'
import {
  blockTransformDefault,
  inlinesTransformDefault,
  textTransformDefault,
} from './getBlockInlines.js'

const TAG_STATE = Symbol('TagState')
const SEND_RECEIVE = Symbol('SendReceive')

export const interpreters: Record<string, Interpreter> = {
  print: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const documentAst = command.ast as
        | DocumentNode
        | BlockNode
        | TagNode
        | TextNode

      const preloadIter = context.dispatch({
        name: 'preload',
        node: documentAst,
      })

      for await (const _data of preloadIter) {
        /* pass */
      }

      const renderIter = context.dispatch({
        name: 'render',
        node: documentAst,
      })

      const collection: Data[] = []
      for await (const data of renderIter) {
        collection.push(data)
      }
    },
  },

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
            ...command,
            name: 'renderDocument',
            node,
          })
        }

        case 'Tag': {
          return yield* context.dispatch({
            ...command,
            name: 'renderTag',
            node,
          })
        }

        case 'Text': {
          return yield* context.dispatch({
            ...command,
            name: 'renderText',
            node,
          })
        }

        case 'Block': {
          return yield* context.dispatch({
            ...command,
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

      if (!context.registry.getTagResolver('__root__')) {
        for (const childNode of node.body) {
          yield* context.dispatch({
            name: 'render',
            node: childNode,
          })
        }

        return
      }

      const tagNode: TagNode = {
        type: 'Tag',
        id: { name: '__root__', type: 'Identifier' },
        attrs: [],
        params: [],
        blocks: [
          {
            type: 'Block',
            body: node.body,
          },
        ],
      }

      yield* context.dispatch({
        name: 'render',
        node: tagNode,
      })
    },
  },

  renderTag: {
    modifier: 'private',

    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const node = command.node as TagNode
      const resolve = command.resolve as () => AsyncGenerator<
        Data,
        void,
        any
      >

      const resolver = command.resolve
        ? {
            resolve,
          }
        : context.registry.getTagResolver(node.id.name)

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
        type: 'text',
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
      const symbol = command.node as symbol

      if (symbol) {
        return context.getState(symbol)
      }

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

      const block = tagNode.blocks[index]
      if (!block) {
        return
      }

      if (block.body.length === 0) {
        return []
      }

      const childNodes = block.body
      const transformedChildNodes: any[] = []

      for (const childNode of childNodes) {
        for await (const data of context.dispatch({
          name: 'render',
          node: childNode,
        })) {
          if (data.name === 'html') {
            transformedChildNodes.push({
              type: data.type,
              content: data.content,
            })
          }
        }
      }

      return transformedChildNodes
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

  getBlockInlines: {
    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const tagNode = command.node as TagNode
      const index = command.index ?? 0

      const transformText = (command?.transform?.text ??
        textTransformDefault) as (
        content: string
      ) => AsyncGenerator<Data, any, any>
      const transformInlines = (command?.transform?.inlines ??
        inlinesTransformDefault) as (
        content: string
      ) => AsyncGenerator<Data, any, any>

      const transformBlock = (command?.transform?.block ??
        blockTransformDefault) as (
        content: string
      ) => AsyncGenerator<Data, any, any>

      const block = tagNode.blocks[index]
      if (!block) {
        return
      }

      if (block.body.length === 0) {
        return []
      }

      const childNodes = block.body
      const transformedChildNodes: any[] = []

      for (const childNode of childNodes) {
        for await (const data of context.dispatch({
          name: 'render',
          node: childNode,
        })) {
          if (data.name === 'html') {
            if (data.type === 'hard-break') {
              transformedChildNodes.push({
                type: 'block',
                content: '',
              })

              continue
            }

            if (data.type === 'text') {
              for await (const childData of context.dispatch({
                name: 'render',
                node: tagNode,
                resolve: transformText.bind(null, data.content),
              })) {
                if (childData.name === 'html') {
                  if (childData.type === 'hard-break') {
                    transformedChildNodes.push({
                      type: 'block',
                      content: '',
                    })

                    continue
                  }

                  transformedChildNodes.push({
                    type: childData.type,
                    content: childData.content,
                  })
                }
              }

              continue
            }

            transformedChildNodes.push({
              type: data.type,
              content: data.content,
            })
          }
        }
      }

      const dispatchers = transformedChildNodes
        .reduce((items, childNode) => {
          if (items.length === 0) {
            return [[childNode]]
          }

          const lastItem = items[items.length - 1]
          if (
            lastItem[0].type === 'block' ||
            !lastItem[0].type
          ) {
            if (childNode.type === 'block' || !childNode.type) {
              return [
                ...items.slice(0, items.length - 1),
                [...lastItem, childNode],
              ]
            }

            return [...items, [childNode]]
          }

          if (childNode.type === 'block' || !childNode.type) {
            return [...items, [childNode]]
          }

          return [
            ...items.slice(0, items.length - 1),
            [...lastItem, childNode],
          ]
        }, [])
        .map((childNodes) => {
          const content = childNodes
            .map((childNode) => {
              return childNode.content
            })
            .join('')

          if (
            childNodes[0].type === 'block' ||
            !childNodes[0].type
          ) {
            return transformBlock.bind(null, content)
          }

          return transformInlines.bind(null, content)
        })
        .map((resolve) => {
          return context.dispatch({
            name: 'render',
            node: tagNode,
            resolve,
          })
        })

      const renderedInlines: string[] = []

      for (const dispatcher of dispatchers) {
        for await (const data of dispatcher) {
          if (data.name === 'html') {
            renderedInlines.push(data.content)
          }
        }
      }

      return renderedInlines.join('')
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
      const type =
        (command.type as string | undefined) || 'block'

      const emit = command.emit as boolean | undefined

      const rendered = template({ data })

      if (emit !== false) {
        yield {
          name: 'html',
          type,
          content: rendered,
        }
      }

      return rendered
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
      const topic = command.topic as symbol
      const data = command.data

      const state = context.getState(SEND_RECEIVE) as any

      if (!state[topic]) {
        state[topic] = []
      }

      state[topic].push(data)
    },
  },

  receive: {
    interpret: async function* (
      command: Command,
      context: Context
    ): AsyncGenerator<Data, any, any> {
      const topic = command.topic as symbol

      const state = context.getState(SEND_RECEIVE) as any

      return state[topic]?.slice?.() ?? []
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

  addDeps: {
    interpret: async function* (
      command: Command,
      _context: Context
    ): AsyncGenerator<Data, any, any> {
      const depsType = command.type as 'js' | 'css' | undefined

      for (const dep of command.deps as any[]) {
        const type =
          depsType ?? (dep.type as 'js' | 'css' | undefined)
        const src = dep.src as string | undefined

        yield {
          name: 'dependency',
          type,
          src,
        }
      }
    },
  },
}
