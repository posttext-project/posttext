/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import fs from 'fs-extra'
import path from 'path'

import { CommandOptions, Command } from './command'
import { Compiler } from '../compiler'
import { interpreters } from '../printer/web'

export class CompileCommand implements Command {
  private args: string[]

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static create(options: CommandOptions): CompileCommand {
    return new CompileCommand(options)
  }

  async run(): Promise<void> {
    const filePath = path.resolve(process.cwd(), this.args[0])
    const input = await fs.readFile(filePath, 'utf8')

    const compiler = Compiler.create()

    compiler.getPrinter().registerInterpreters(interpreters)

    await compiler.compile(input)
  }
}
