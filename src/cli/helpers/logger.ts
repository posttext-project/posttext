import chalk from 'chalk'

export class Logger {
  static create(): Logger {
    return new Logger()
  }

  log(...message: string[]) {
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
