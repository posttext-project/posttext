/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import chalk from 'chalk'

export class Logger {
  static create(): Logger {
    return new Logger()
  }

  log(...message: string[]): void {
    const time = new Date()
    console.log(
      `[${chalk.blue(
        `${time
          .getHours()
          .toString()
          .padStart(
            2,
            '0'
          )}:${time
          .getMinutes()
          .toString()
          .padStart(
            2,
            '0'
          )}:${time.getSeconds().toString().padStart(2, '0')}`
      )}]`,
      ...message
    )
  }
}
