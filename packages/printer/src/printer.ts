/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as ast from '../ast'
import { Interpreter, Context } from './interpreter'
import { Command } from './command'
import { Registry } from '../registry'
import { AnonymousContext } from './context'
import { Data } from './data'
import {
  BlockNode,
  DocumentNode,
  TagNode,
  TextNode,
} from './ast'

export interface PrinterComponents {
  registry: Registry
}

export interface PrinterInput {
  ast: ast.DocumentNode
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

  private copyInput(
    node:
      | ast.DocumentNode
      | ast.BlockNode
      | ast.TagNode
      | ast.TextNode
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
