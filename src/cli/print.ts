import path from 'path'
import chalk from 'chalk'

import { CommandOptions, Command } from './command'
import { Compiler } from '../compiler'
import StandardModule from '../modules/standard'
import {
  EpubPrinter,
  Printer,
  RootInterpreter
} from '../printer'
import {
  TreeInterpreter,
  TreeDispatcher
} from '../printer/interpreters/tree'
import { HtmlInterpreter } from '../printer/interpreters/html'
import { HtmlPrinter } from '../printer/html'

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
        },
        target: 'html'
      })

      compiler.generator.registerRootModule(
        new StandardModule()
      )

      compiler.registerPrinter('html', async () =>
        HtmlPrinter.new()
      )

      const outputHtml = await compiler.compile()

      console.log(outputHtml)
    } catch (err) {
      console.log(chalk.red('error') + '  ' + err)
    }
  }
}
