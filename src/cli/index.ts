import meow from 'meow'
import { CompileCommand } from './compile'
import { ServeCommand } from './serve'
import { PrintCommand } from './print'
import chalk from 'chalk'

export class CLI {
  private cli: meow.Result<any>

  constructor({ cli }: { cli: meow.Result<any> }) {
    this.cli = cli
  }

  static new(): CLI {
    const cli = meow(
      `
        Usage
          $ pt [command] <input>

        Options
          --help, -h    Show this help message.

        Commands
          compile       Build an input file.
          serve         Build and serve an input file.
          print         Print the compiler output to stdout.

        Examples
          $ pt serve <input>
          $ pt compile <input>
      `,
      {
        description: false,
        hardRejection: false,
        autoHelp: false,
      }
    )

    return new CLI({
      cli,
    })
  }

  async run(): Promise<void> {
    try {
      const args = this.cli?.input?.slice(1) ?? []
      const command =
        this.cli?.input?.[0]?.toLowerCase() ?? 'help'

      switch (command) {
        case 'compile':
          await this.compile(args)

          return

        case 'serve':
          await this.serve(args)

          return

        case 'print':
          await this.print(args)

          return

        default:
          this.cli.showHelp()
      }
    } catch (error) {
      console.log(chalk.bgRed(' ERROR '), error)
    }
  }

  async compile(
    args: string[],
    flags: meow.Options<any> = {}
  ): Promise<any> {
    const command = CompileCommand.create({
      args,
      flags,
    })

    await command.run()
  }

  async serve(
    args: string[],
    flags: meow.Options<any> = {}
  ): Promise<any> {
    const command = ServeCommand.create({
      args,
      flags,
    })

    await command.run()
  }

  async print(
    args: string[],
    flags: meow.Options<any> = {}
  ): Promise<any> {
    const command = PrintCommand.create({
      args,
      flags,
    })

    await command.run()
  }
}
