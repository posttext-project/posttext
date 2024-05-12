/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as meow from 'meow'
import chalk from 'chalk'

import { CompileCommand } from './compile.js'
import { ServeCommand, createServeCommand } from './serve.js'

export interface CLI {
  run(): Promise<void>
}

export function createCLI(): CLI {
  const cli = meow.default(
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
      importMeta: import.meta,
      description: false,
      hardRejection: false,
      autoHelp: false,
    }
  )

  return {
    run: (): Promise<void> => run(cli),
  }
}

async function run(cli: meow.Result<any>): Promise<void> {
  try {
    const args = cli?.input?.slice(1) ?? []
    const command = cli?.input?.[0]?.toLowerCase() ?? 'help'

    switch (command) {
      case 'compile':
        await compile(args, cli.flags)
        return
      case 'serve':
        await serve(args, cli.flags)
        return
      default:
        cli.showHelp()
    }
  } catch (error) {
    console.log(chalk.bgRed(' ERROR '), error)
  }
}

async function compile(
  args: string[],
  flags: Record<string, unknown> = {}
): Promise<any> {
  const command = CompileCommand.create({
    args,
    flags,
  })

  await command.run()
}

async function serve(
  args: string[],
  flags: Record<string, unknown> = {}
): Promise<any> {
  const command = createServeCommand({
    args,
    flags,
  })

  await command.run()
}
