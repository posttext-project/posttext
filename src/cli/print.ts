import fs from 'fs-extra'
import path from 'path'

import { CommandOptions, Command } from './command'
import { Compiler } from '../compiler'

export class PrintCommand implements Command {
  private args: string[]

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static create(options: CommandOptions): PrintCommand {
    return new PrintCommand(options)
  }

  async run(): Promise<void> {
    const compiler = Compiler.create()

    const filePath = path.resolve(process.cwd(), this.args[0])
    const input = await fs.readFile(filePath, 'utf-8')

    await compiler.compile(input)
  }
}
