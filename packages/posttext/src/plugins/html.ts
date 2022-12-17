/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {
  TagNode,
} from '../parser/ast.js'
import { Command } from '../command.js'
import { Plugin } from '../plugin.js'
import { CommandResolver } from '../resolver.js'

export interface Html {
  html: string
}

export class HtmlPlugin implements Plugin {
  getCommandResolvers(): Record<string, CommandResolver> {
    return {
      async *getNumberOfBlocks(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as TagNode

        return node.blocks.length
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

        const html: Html[] = []

        return html
      },

      async *getText(): AsyncGenerator<Command, any, any> {
        return ''
      },

      async *getInlines(): AsyncGenerator<Command, any, any> {
        return ''
      },

      async *getBlockAndInlines(): AsyncGenerator<
        Command,
        any,
        any
      > {
        return ''
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
