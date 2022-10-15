/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Interpreter } from './interpreter'
import { Parser } from './parser'
import { Plugin } from './plugin'
import { CommonPlugin } from './plugins'
import { Registry } from './registry'

export interface BundlerOptions {
  parser: Parser
  registry: Registry
  plugins: Plugin[]
}

export interface BundleOptions {
  input: string
  output: string
  js: string[]
  css: string[]
}

export interface BundlerStruct {
  interpreter: Interpreter
}

export class Bundler {
  private interpreter: Interpreter

  static create(options: BundlerOptions): Bundler {
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

    return new Bundler({ interpreter })
  }

  constructor({ interpreter }: BundlerStruct) {
    this.interpreter = interpreter
  }

  async bundle(options: BundleOptions): Promise<void> {
    return this.interpreter.run(async function* () {
      return yield {
        ...options,
        name: 'bundle',
      }
    })
  }
}
