/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as meow from 'meow'
import chalk from 'chalk'
import { createBuildCommand } from './build'

export interface CLI {
  run(): Promise<void>
}

export function createCLI(): CLI {
  const cli = meow.default(
    `
      Usage
        $ pt [command]

      Options
        --help, -h    Show this help message.

      Commands
        build         Run build project.

      Examples
        $ pt build
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
      case 'build':
        await build(args, cli.flags)
        break
      default:
        cli.showHelp()
    }
  } catch (error) {
    console.log(chalk.bgRed(' ERROR '), error)
  }
}

async function build(
  args: string[],
  flags: Record<string, unknown> = {}
): Promise<void> {
  const command = createBuildCommand({
    args,
    flags,
  })

  await command.run()
}
