/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { TagNode } from '../parser/ast.js'
import { Registry } from '../registry.js'
import { Command } from '../command.js'
import { Plugin } from '../plugin.js'
import { Scope } from '../scope.js'
import { CommandResolver } from '../resolver.js'

export interface RegistryPluginOptions {
  registry: Registry
}

type InterceptCommandCallback = (Command) => Command

async function* interceptCommands(
  iter: AsyncGenerator<Command, any, any>,
  callback: InterceptCommandCallback
): AsyncGenerator<Command, any, any> {
  let result
  let iterResult = await iter.next(result)
  while (!iterResult.done) {
    const tagCommand = iterResult.value as Command

    result = yield callback(tagCommand)

    iterResult = await (await iter.next(result)).value
  }

  return result
}

function withNode(node: TagNode): (Command) => Command {
  return (command): Command =>
    command.node
      ? command
      : {
          ...command,
          node,
        }
}

export class RegistryPlugin implements Plugin {
  constructor(private options: RegistryPluginOptions) {}

  getCommandResolvers(): Record<string, CommandResolver> {
    const registry = this.options.registry
    const scope = new Scope({ registry })

    return {
      async *resolveTag(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as TagNode

        const resolver = scope.getTagResolver(node.id.name)
        const iter = resolver?.resolve()

        return iter
          ? yield* interceptCommands(iter, withNode(node))
          : null
      },

      async *resolveTagInlines(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as TagNode

        const resolver = scope.getTagResolver(node.id.name)
        const iter = resolver?.inlines?.()

        return iter
          ? yield* interceptCommands(iter, withNode(node))
          : null
      },

      async *resolveTagText(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as TagNode

        const resolver = scope.getTagResolver(node.id.name)
        const iter = resolver?.text?.()

        return iter
          ? yield* interceptCommands(iter, withNode(node))
          : null
      },

      async *getAttrs(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as TagNode

        const attrs = {}
        for (const attr of node.attrs) {
          attrs[attr.id.name] = attr.value
        }

        return attrs
      },

      async *getParams(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as TagNode

        return node.params.map((param) => param.value)
      },

      async *getData(
        command: Command
      ): AsyncGenerator<Command, any, any> {
        const node = command.node as TagNode
        const selector = command.selector as string

        const resolver = scope.getTagResolver(node.id.name)
        const iter = resolver?.data?.[selector]?.()

        return iter
          ? yield* interceptCommands(iter, withNode(node))
          : null
      },

      async *queryData(
        _command: Command
      ): AsyncGenerator<Command, any, any> {
        return null
      },

      async *queryAllData(
        _command: Command
      ): AsyncGenerator<Command, any, any> {
        return null
      },

      async *queryChildData(
        _command: Command
      ): AsyncGenerator<Command, any, any> {
        return null
      },

      async *queryAllChildData(
        _command: Command
      ): AsyncGenerator<Command, any, any> {
        return null
      },

      async *queryParentData(
        _command: Command
      ): AsyncGenerator<Command, any, any> {
        return null
      },

      async *queryAllParentData(
        _command: Command
      ): AsyncGenerator<Command, any, any> {
        return null
      },
    }
  }
}
