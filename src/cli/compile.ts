import fs from 'fs-extra'
import path from 'path'

import { CommandOptions, Command } from './command'
import { Compiler } from '../compiler'

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
    const input = await fs.readFile(filePath, 'utf-8')

    const compiler = Compiler.create()

    const result = await compiler.compile(input)
    const outputHtml = result?.content

    const inputPath = path.parse(this.args[0])
    const outputPath = path.resolve(
      inputPath.dir,
      inputPath.name + '.html'
    )

    await fs.outputFile(outputPath, outputHtml)
  }
}
