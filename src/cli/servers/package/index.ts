import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import { Logger } from '../../helpers/logger'
import boxen from 'boxen'

export interface PackageServerOptions {
  rootPath: string
}

export class PackageServer {
  rootPath: string

  logger: Logger = Logger.create()

  static create({
    rootPath,
  }: PackageServerOptions): PackageServer {
    return new PackageServer({
      rootPath,
    })
  }

  constructor({ rootPath }: PackageServerOptions) {
    this.rootPath = rootPath
  }

  async serve(): Promise<void> {
    const outputPath = path.resolve(process.cwd(), 'dist')
    const inputPath = path.resolve(this.rootPath)

    await this.build(this.rootPath, outputPath)

    console.log(
      boxen(`${chalk.yellow('open')}      ${outputPath}`, {
        borderColor: 'yellow',
        margin: 1,
        padding: 1,
      })
    )

    chokidar.watch(inputPath).on('change', async () => {
      try {
        this.logger.log(
          `Start compiling ${chalk.blue(`'${this.rootPath}'`)}`
        )
        const startTime = new Date().getTime()

        const endTime = new Date().getTime()
        const deltaTime = (
          (endTime - startTime) /
          1_000
        ).toPrecision()

        this.logger.log(
          `Finished compiling ${chalk.blue(
            `'${this.rootPath}'`
          )} after ${chalk.magenta(deltaTime)} s`
        )
      } catch (error) {
        this.logger.log(chalk.bgRed(' ERROR ', error))
      }
    })
  }

  private async build(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    await fs.ensureDir(outputPath)
  }
}
