/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import meow from 'meow'
import { CompileCommand } from './compile'
import { ServeCommand } from './serve'
import chalk from 'chalk'
import { Logger } from './helpers/logger'

export class CLI {
  private cli: meow.Result<any>

  private logger: Logger = Logger.create()

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

        default:
          this.cli.showHelp()
      }
    } catch (error) {
      this.logger.error(chalk.bgRed(' ERROR '), error)
    }
  }

  async compile(
    args: string[],
    flags: meow.Options<any> = {}
  ): Promise<any> {
    const command = CompileCommand.create({
      args,
      flags,
      logger: this.logger,
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
      logger: this.logger,
    })

    await command.run()
  }
}
