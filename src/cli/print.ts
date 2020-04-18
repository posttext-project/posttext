import path from 'path'
import chalk from 'chalk'

import { CommandOptions, Command } from './command'
import { Compiler } from '../compiler'
import StandardModule from '../modules/standard'

export class PrintCommand implements Command {
  private args: string[]

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static new(options: CommandOptions): PrintCommand {
    return new PrintCommand(options)
  }

  async run(): Promise<void> {
    try {
      const compiler = Compiler.new({
        input: {
          file: path.resolve(process.cwd(), this.args[0])
        }
      })

      compiler.generator.registerRootModule(
        new StandardModule()
      )

      const outputHtml = await compiler.compile()

      console.log(outputHtml)
    } catch (err) {
      console.log(chalk.red('error') + '  ' + err)
    }
  }
}
