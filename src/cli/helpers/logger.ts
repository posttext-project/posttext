/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import chalk from 'chalk'
import indentString from 'indent-string'

export interface Logger {
  log(...args: any[]): void
  info(...args: any[]): void
  warn(...args: any[]): void
  error(...args: any[]): void
}

export class Logger {
  static create(): Logger {
    return new Logger()
  }

  protected toLogMessage(args: any[]): string {
    let content = args.map((arg) => String(arg)).join(' ')
    const multiline = content.includes('\n')

    if (multiline) {
      content = '\n' + content
    }

    return indentString(content + '\n', 4)
  }

  log(...args: any[]): void {
    console.log(...args)
  }

  info(...args: any[]): void {
    console.info(
      chalk.bgCyan(' INFO '),
      this.toLogMessage(args)
    )
  }

  warn(...args: any[]): void {
    console.warn(
      chalk.bgYellow(' WARN '),
      this.toLogMessage(args)
    )
  }

  error(...args: any[]): void {
    console.error(
      chalk.bgRed(' ERROR '),
      this.toLogMessage(args)
    )
  }
}
