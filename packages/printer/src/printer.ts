/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import {
  Registry,
  Command,
  Data,
  Context,
  Interpreter,
} from '@posttext/registry'
import {
  DocumentNode,
  BlockNode,
  TagNode,
  TextNode,
} from '@posttext/parser'

import { AnonymousContext } from './context.js'

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

  getRegistry(): Registry {
    return this.registry
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

  private copyInput(
    node: DocumentNode | BlockNode | TagNode | TextNode
  ): DocumentNode | BlockNode | TagNode | TextNode {
    switch (node.type) {
      case 'Document': {
        return {
          ...node,
          __metadata: {},
          body: node.body.map(this.copyInput.bind(this)),
        }
      }

      case 'Block': {
        return {
          ...node,
          body: node.body.map(this.copyInput.bind(this)),
        }
      }

      case 'Tag': {
        return {
          ...node,
          __metadata: {},
          attrs: node.attrs.map((attr) => ({
            ...attr,
            id: {
              ...attr.id,
            },
          })),
          params: node.params.map((param) => ({
            ...param,
          })),
          blocks: node.blocks.map(this.copyInput.bind(this)),
        }
      }

      case 'Text': {
        return {
          ...node,
        }
      }
    }

    return node
  }

  async print(input: PrinterInput): Promise<void> {
    const { ast: inputAst } = input

    const ast = this.copyInput(inputAst)

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

    const printIter = this.interpret(
      {
        name: 'print',
        ast: ast,
      },
      context
    )

    for await (const _data of printIter) {
      /* pass */
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
