import meow from 'meow'
import path from 'path'
import chalk from 'chalk'

import { Compiler } from '../compiler'

export class Cli {
  cli: meow.Result<any>

  init() {
    this.cli = meow(
      `
        Usage
          $ pt [command] <input>

        Options
          --help, -h    Show this help message.

        Commands
          compile       Build an input file.
          serve         Build and serve an input file.

        Examples
          $ pt serve <input>
          $ pt compile <input>
      `,
      {
        description: false,
        hardRejection: false,
        autoHelp: false
      }
    )

    switch (this.cli?.input?.[0]?.toLowerCase()) {
      case 'compile':
        this.compile()
        return

      case 'serve':
        this.serve()
        return

      default:
        this.cli.showHelp()
    }
  }

  async compile() {
    try {
      const compiler = new Compiler({
        input: {
          file: path.resolve(process.cwd(), this.cli.input[1])
        }
      })
      compiler.init()

      await compiler.compile()
    } catch (err) {
      console.log(chalk.red('error'), err)
    }
  }

  serve() {}
}
