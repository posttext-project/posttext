/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { CommandOptions } from './command.js'

interface BuildCommand {
  run(): Promise<void>
}

export function createBuildCommand(
  options: CommandOptions
): BuildCommand {
  return {
    run: (): Promise<void> => run(options.args),
  }
}

async function run(_args: string[]): Promise<void> {
  return
}
