import ws from 'ws'
import Koa from 'koa'
import { Compiler } from '../../../compiler'
import fs from 'fs-extra'
import { getInterpreters } from '../../../printer/web'
import path from 'path'
import http from 'http'
import serve from 'koa-static'
import boxen from 'boxen'
import chalk from 'chalk'
import Router from '@koa/router'
import chokidar from 'chokidar'
import { Subject } from 'rxjs'
import { Logger } from '../../helpers/logger'

export interface FileServerOptions {
  input: string
  port?: number
}

export class FileServer {
  input: string
  port: number

  logger: Logger = Logger.create()

  static create({
    input,
    port = 8080,
  }: FileServerOptions): FileServer {
    return new FileServer({ input, port })
  }

  constructor({ input, port }: FileServerOptions) {
    this.input = input
    this.port = port!
  }

  async serve(): Promise<void> {
    const app = new Koa()
    const server = http.createServer(app.callback())
    const router = new Router()
    const wss = new ws.Server({ server })

    const inputPath = path.resolve(process.cwd(), this.input)
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
          `Starting compiling ${chalk.blue(`'${this.input}'`)}`
        )
        const startTime = new Date().getTime()

        await this.build(inputPath, outputPath)

        const endTime = new Date().getTime()
        const deltaTime = (
          (endTime - startTime) /
          1_000
        ).toPrecision()

        this.logger.log(
          `Finished compiling ${chalk.blue(
            `'${this.input}'`
          )} after ${chalk.magenta(deltaTime)} s`
        )

        this.logger.log(
          `Reloading ${chalk.blue(`'${this.input}'`)}`
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

    server.listen(this.port, () => {
      console.log(
        boxen(
          `${chalk.yellow('serve')}      http://localhost:${
            this.port
          }`,
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

    const interpreters = getInterpreters({
      js: [path.resolve(__dirname, '../../assets/bundle.ts')],
      css: [path.resolve(__dirname, '../../assets/bundle.css')],
      mode: 'development',
    })

    const compiler = Compiler.create()
    compiler.getPrinter().registerInterpreters(interpreters)

    const input = await fs.readFile(inputPath, 'utf-8')
    await compiler.compile(input)
  }
}
