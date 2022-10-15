/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import fs from 'fs-extra'
import path from 'path'
import { Compiler, Registry } from '@posttext/posttext'
import StdPackage from '@posttext/package-std'

import { CommandOptions, Command } from './command.js'

export class CompileCommand implements Command {
  private args: string[]

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static create(options: CommandOptions): CompileCommand {
    return new CompileCommand(options)
  }

  async run(): Promise<void> {
    try {
      const inputPath = path.resolve(
        process.cwd(),
        this.args[0]
      )
      const outputPath = path.resolve(process.cwd(), 'dist')
      const input = await fs.readFile(inputPath, 'utf8')

      const registry = new Registry()
      registry.addPackage('std', new StdPackage())

      const compiler = Compiler.create({
        registry,
        plugins: [],
      })

      const htmlResult = await compiler.compile(input)

      await fs.writeFile(outputPath, htmlResult.html)
    } catch (err) {
      console.log(err)
    }
  }
}
