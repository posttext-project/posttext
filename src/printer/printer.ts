/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { DocumentNode } from '../ast'
import { Interpreter, Context } from './interpreter'
import { Command } from './command'
import { Registry } from '../registry'
import { AnonymousContext } from './context'
import { Data } from './data'

export interface PrinterComponents {
  registry: Registry
}

export interface PrinterInput {
  ast: DocumentNode
}

export class Printer {
  private interpreters: Map<string, Interpreter>
  private registry: Registry

  static create(components: PrinterComponents): Printer {
    return new Printer(components)
  }

  constructor({ registry }: PrinterComponents) {
    this.interpreters = new Map()
    this.registry = registry
  }

  registerInterpreters(
    interpreters: Record<string, Interpreter>
  ): void {
    for (const [name, interpreter] of Object.entries(
      interpreters
    )) {
      this.interpreters.set(name, interpreter)
    }
  }

  async print(input: PrinterInput): Promise<void> {
    const { ast } = input

    const self = this
    const context = AnonymousContext.create({
      dispatch: async function* (
        command: Command
      ): AsyncGenerator<Data, any, any> {
        return yield* self.interpret(command, context)
      },
      interpreters: this.interpreters,
      registry: this.registry,
      stateMap: new Map(),
    })

    const preloadIter = this.interpret(
      {
        name: 'preload',
        node: ast,
      },
      context
    )

    let preloadResult = await preloadIter.next()
    while (!preloadResult.done) {
      preloadResult = await preloadIter.next()
    }

    const renderIter = this.interpret(
      {
        name: 'render',
        node: ast,
      },
      context
    )

    const collection: Data[] = []
    for await (const data of renderIter) {
      collection.push(data)
    }
  }

  async *interpret(
    command: Command,
    context: Context
  ): AsyncGenerator<Data, any, any> {
    const interpreter = context.interpreters.get(command.name)
    if (!interpreter) {
      return
    }

    return yield* interpreter.interpret(command, context)
  }
}
