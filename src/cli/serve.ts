import ws from 'ws'
import fs from 'fs-extra'
import Koa from 'koa'
import http from 'http'
import path from 'path'
import serve from 'koa-static'
import boxen from 'boxen'
import chalk from 'chalk'
import Router from '@koa/router'
import chokidar from 'chokidar'
import { Subject } from 'rxjs'

import { Command, CommandOptions } from './command'
import { Compiler } from '../compiler'
import { interpreters } from '../printer/web'
import { Logger } from './helpers/logger'

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

  private async build(inputPath: string, outputPath: string): Promise<void> {
    const bundleFile = path.resolve(
      __dirname,
      'assets/bundle.js'
    )
    const bundleFileMap = path.resolve(
      __dirname,
      'assets/bundle.js'
    )

    await fs.ensureDir(outputPath)
    await fs.copyFile(
      bundleFile,
      path.resolve(outputPath, 'bundle.js')
    )
    await fs.copyFile(
      bundleFileMap,
      path.resolve(outputPath, 'bundle.js.map')
    )

    const compiler = Compiler.create()
    compiler.getPrinter().registerInterpreters(interpreters)

    const input = await fs.readFile(inputPath, 'utf-8')
    await compiler.compile(input)
  }
}
