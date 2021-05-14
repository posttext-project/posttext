import path from 'path'
import chalk from 'chalk'
import fs from 'fs-extra'
import chokidar from 'chokidar'
import boxen from 'boxen'

import { Compiler } from '../../../compiler'
import { Logger } from '../../helpers/logger'

export interface PackageServerOptions {
  input: string
}

export interface PackageServerComponents {
  options: PackageServerOptions

  logger: Logger
}

export class PackageServer {
  options: PackageServerOptions

  logger: Logger

  static create({
    options,
    logger,
  }: PackageServerComponents): PackageServer {
    return new PackageServer({
      options,
      logger,
    })
  }

  constructor({ options, logger }: PackageServerComponents) {
    this.options = options
    this.logger = logger
  }

  async serve(): Promise<void> {
    const outputPath = path.resolve(process.cwd(), 'target')
    const inputPath = path.resolve(this.options.input)

    await this.build(inputPath, outputPath)

    this.logger.log(
      boxen(`${chalk.yellow('open')}      ${outputPath}`, {
        borderColor: 'yellow',
        margin: 1,
        padding: 1,
      })
    )

    chokidar.watch(inputPath).on('change', async () => {
      try {
        this.logger.info(
          `Start compiling ${chalk.blue(
            `'${this.options.input}'`
          )}`
        )
        const startTime = new Date().getTime()

        const endTime = new Date().getTime()
        const deltaTime = (
          (endTime - startTime) /
          1_000
        ).toPrecision()

        this.logger.info(
          `Finished compiling ${chalk.blue(
            `'${this.options.input}'`
          )} after ${chalk.magenta(deltaTime)} s`
        )
      } catch (error) {
        this.logger.error(chalk.bgRed(' ERROR ', error))
      }
    })
  }

  private async build(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    await fs.ensureDir(outputPath)

    const compiler = Compiler.create()

    compiler.compile(inputPath)
  }
}
