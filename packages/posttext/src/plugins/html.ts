/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { DocumentNode, Node, TagNode } from '../parser/ast.js'
import { Command } from '../command.js'
import { Plugin } from '../plugin.js'
import { CommandResolver } from '../resolver.js'

export interface HtmlRenderResult {
  html: string
}

export class HtmlPlugin implements Plugin {
  getCommandResolvers(): Record<string, CommandResolver> {
    return {
      async *render(
        command: Command
      ): AsyncGenerator<any, any, Command> {
        const node = command.node as Node

        switch (node.type) {
          case 'Document': {
            return yield {
              name: 'renderDocument',
              node,
            }
          }

          case 'Tag': {
            return yield {
              name: 'renderTag',
              node,
            }
          }

          case 'Text': {
            return yield {
              name: 'renderTagText',
              node,
            }
          }

          case 'Block': {
            return yield {
              name: 'renderTagBlock',
              node,
            }
          }
        }
      },

      async *renderDocument(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as DocumentNode

        const childHtmlResults: HtmlRenderResult[] = []
        for (const childNode of node.body) {
          const childHtmlResult: HtmlRenderResult = yield {
            name: 'render',
            node: childNode,
          }

          childHtmlResults.push(childHtmlResult)
        }

        const childrenHtml = childHtmlResults
          .map((item) => item.html)
          .join('')

        return {
          html: childrenHtml,
        } as HtmlRenderResult
      },

      async *renderTagText(): AsyncGenerator<
        Command,
        any,
        any
      > {
        return null
      },

      async *renderTagInlines(): AsyncGenerator<
        Command,
        any,
        any
      > {
        return null
      },

      async *renderTag(): AsyncGenerator<Command, any, any> {
        return null
      },

      async *blockCount(): AsyncGenerator<Command, any, any> {
        return null
      },

      async *getHtml(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const tagNode = command.node as TagNode
        const index = command.index ?? 0

        const block = tagNode.blocks[index]
        if (!block) {
          return
        }

        const childNodesHtml: HtmlRenderResult[] = []
        for (const childNode of block.body) {
          for await (const childNodeHtml of yield {
            name: 'render',
            node: childNode,
          }) {
            childNodesHtml.push(childNodeHtml)
          }
        }

        return childNodesHtml
      },

      async *getText(): AsyncGenerator<Command, any, any> {
        return []
      },

      async *getInlines(): AsyncGenerator<Command, any, any> {
        return []
      },

      async *metadata(): AsyncGenerator<Command, any, any> {
        return {}
      },

      async *addDeps(): AsyncGenerator<Command, any, any> {
        return null
      },
    }
  }
}
