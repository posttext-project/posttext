/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Interpreter } from './interpreter'
import { Parser } from './parser'
import { Plugin } from './plugin'
import { CommonPlugin } from './plugins'
import { Registry } from './registry'

export interface CompilerOptions {
  parser?: Parser
  registry: Registry
  plugins: Plugin[]
}

export interface CompilerStruct {
  interpreter: Interpreter
}

export class Compiler {
  private interpreter: Interpreter

  constructor({ interpreter }: CompilerStruct) {
    this.interpreter = interpreter
  }

  static create(options: CompilerOptions): Compiler {
    const parser = options.parser ?? Parser.create()

    const interpreter = Interpreter.create({
      plugins: () => [
        new CommonPlugin({
          parser,
          registry: options.registry,
        }),
        ...options.plugins,
      ],
    })

    return new Compiler({ interpreter })
  }

  async compile(input: string): Promise<any> {
    return this.interpreter.run(async function* () {
      return yield {
        name: 'compile',
        input,
      }
    })
  }
}
