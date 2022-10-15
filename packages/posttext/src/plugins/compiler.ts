/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Plugin } from '../plugin.js'
import { Parser } from '../parser/index.js'
import { Command } from '../command.js'
import { CommandResolver } from '../resolver.js'

export interface CompilerPluginOptions {
  parser: Parser
}

export class CompilerPlugin implements Plugin {
  constructor(private options: CompilerPluginOptions) {}

  getCommandResolvers(): Record<string, CommandResolver> {
    const options = { ...this.options }

    return {
      async *compile(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const input = command.input as string

        const ast = options.parser.parse(input)

        return yield {
          name: 'render',
          node: ast,
        }
      },
    }
  }
}
