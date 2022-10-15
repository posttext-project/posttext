/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Command } from './command'
import { Plugin } from './plugin'
import { CommandResolver } from './resolver'

export interface InterpreterOptions {
  plugins: () => Plugin[]
}

export interface InterpreterStruct {
  plugins: () => Plugin[]
}

export class Interpreter {
  private plugins: () => Plugin[]

  static create({ plugins }: InterpreterOptions): Interpreter {
    return new Interpreter({ plugins })
  }

  constructor({ plugins }: InterpreterStruct) {
    this.plugins = plugins
  }

  async run<ReturnType>(
    callback: () => AsyncGenerator<Command, ReturnType, any>
  ): Promise<ReturnType> {
    return this.runIter(callback())
  }

  private getPlugins(): Plugin[] {
    return this.plugins()
  }

  private getCommandResolvers(
    plugins: Plugin[]
  ): Record<string, CommandResolver> {
    let resolvers = {}

    for (const plugin of plugins) {
      const pluginResolvers = plugin.getCommandResolvers?.()

      if (pluginResolvers) {
        resolvers = {
          ...resolvers,
          ...pluginResolvers,
        }
      }
    }

    return resolvers
  }

  private async runIter<ReturnType>(
    iter: AsyncGenerator<Command, ReturnType, any>
  ): Promise<ReturnType> {
    const plugins = this.getPlugins()
    const resolvers = this.getCommandResolvers(plugins)

    return this.runIterWithResolvers(iter, resolvers)
  }

  private async runIterWithResolvers<ReturnType>(
    iter: AsyncGenerator<Command, ReturnType, any>,
    resolvers: Record<string, CommandResolver>
  ): Promise<ReturnType> {
    let result = await iter.next()

    while (!result.done) {
      const command = result.value
      const resolver = resolvers[command.name]

      const resolverResult = await this.runIter(
        resolver(command)
      )

      result = await iter.next(resolverResult)
    }

    return result.value
  }
}
