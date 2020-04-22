import fs from 'fs-extra'
import path from 'path'
import chalk from 'chalk'

import { CommandOptions, Command } from './command'
import { Compiler } from '../compiler'

export class CompileCommand implements Command {
  private args: string[]

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static new(options: CommandOptions): CompileCommand {
    return new CompileCommand(options)
  }

  async run(): Promise<void> {
    try {
      const compiler = Compiler.new({
        input: {
          file: path.resolve(process.cwd(), this.args[0]),
        },
        target: 'html',
      })

      const outputHtml = await compiler.compile()

      const inputPath = path.parse(this.args[0])
      const outputPath = path.resolve(
        inputPath.dir,
        inputPath.name + '.html'
      )

      await fs.outputFile(outputPath, outputHtml)
    } catch (err) {
      console.log(chalk.red('error') + '  ' + err)
    }
  }
}
