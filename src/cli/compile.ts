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
