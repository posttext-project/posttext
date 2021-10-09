/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import ws from 'ws'
import fs from 'fs-extra'
import Koa from 'koa'
import http from 'http'
import path from 'path'
import serve from 'koa-static'
import boxen from 'boxen'
import chalk from 'chalk'
import findUp from 'find-up'
import Router from '@koa/router'
import chokidar from 'chokidar'
import url from 'url'
import { Subject } from 'rxjs'
import { Compiler } from '@posttext/compiler'
import { importMeta, StdModule } from '@posttext/modules'
import { getInterpreters } from '@posttext/interpreters/web'

import { Command, CommandOptions } from './command.js'
import { Logger } from './helpers/logger.js'

export class ServeCommand implements Command {
  private args: string[]

  private logger: Logger = Logger.create()

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static create(options: CommandOptions): ServeCommand {
    return new ServeCommand(options)
  }

  async run(): Promise<void> {
    const app = new Koa()
    const server = http.createServer(app.callback())
    const router = new Router()
    const wss = new ws.Server({ server })

    const inputPath = path.resolve(process.cwd(), this.args[0])
    const outputPath = path.resolve(process.cwd(), 'dist')

    const reload$ = new Subject<boolean>()

    await this.build(inputPath, outputPath)

    app
      .use(router.routes())
      .use(router.allowedMethods())
      .use(serve(outputPath))

    chokidar.watch(inputPath).on('change', async () => {
      try {
        this.logger.log(
          `Starting compiling ${chalk.blue(
            `'${this.args[0]}'`
          )}`
        )
        const startTime = new Date()

        await this.build(inputPath, outputPath)

        const endTime = new Date()

        this.logger.log(
          `Finished compiling ${chalk.blue(
            `'${this.args[0]}'`
          )} after ${chalk.magenta(
            `${(
              (endTime.getTime() - startTime.getTime()) /
              1000
            ).toPrecision(2)} s`
          )}`
        )

        this.logger.log(
          `Reloading ${chalk.blue(`'${this.args[0]}'`)}`
        )

        reload$.next(true)
      } catch (error) {
        this.logger.log(chalk.bgRed(' ERROR '), error)
      }
    })

    wss.on('connection', (ws) => {
      const subscription = reload$.subscribe(() => {
        ws.send(JSON.stringify({ type: 'reload' }))
      })

      ws.on('close', () => {
        subscription.unsubscribe()
      })
    })

    server.listen(8080, () => {
      console.log(
        boxen(
          chalk.yellow('serve') +
            '      ' +
            'http://localhost:8080',
          {
            borderColor: 'yellow',
            margin: 1,
            padding: 1,
          }
        )
      )
    })
  }

  private async build(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    await fs.ensureDir(outputPath)

    const pathToNodeModules = await findUp('node_modules', {
      cwd: url.fileURLToPath(importMeta.url),
      type: 'directory',
    })

    const interpreters = getInterpreters({
      output: outputPath,
      js: [
        path.resolve(
          path.dirname(url.fileURLToPath(import.meta.url)),
          'assets/bundle.js'
        ),
      ],
      css: [
        path.resolve(
          path.dirname(url.fileURLToPath(import.meta.url)),
          'assets/bundle.css'
        ),
        path.resolve(
          path.dirname(url.fileURLToPath(import.meta.url)),
          'assets/fonts/fonts.css'
        ),
      ],
      mode: 'development',
      resolve: {
        modules: pathToNodeModules ? [pathToNodeModules] : [],
      },
    })

    const compiler = Compiler.create()
    compiler
      .getPrinter()
      .getRegistry()
      .loadModule(StdModule.create())
    compiler.getPrinter().registerInterpreters(interpreters)

    const input = await fs.readFile(inputPath, 'utf-8')
    await compiler.compile(input)
  }
}
