import meow from 'meow'
import { CompileCommand } from './compile'
import { ServeCommand } from './serve'

export class CLI {
  private cli: meow.Result<any>

  constructor({ cli }: { cli: meow.Result<any> }) {
    this.cli = cli
  }

  static new() {
    const cli = meow(
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

    return new CLI({
      cli
    })
  }

  async run() {
    const args = this.cli.input.slice(1)
    const command = this.cli.input[0].toLowerCase()

    switch (command) {
      case 'compile':
        await this.compile(args)

        return

      case 'serve':
        await this.serve(args)

        return

      default:
        this.cli.showHelp()
    }
  }

  async compile(
    args: string[],
    flags: meow.Options<any> = {}
  ): Promise<any> {
    const command = CompileCommand.new({
      args,
      flags
    })

    command.run()
  }

  async serve(
    args: string[],
    flags: meow.Options<any> = {}
  ): Promise<any> {
    const command = ServeCommand.new({
      args,
      flags
    })

    command.run()
  }
}