import ws from 'ws'
import Koa from 'koa'
import http from 'http'
import path from 'path'
import serve from 'koa-static'
import boxen from 'boxen'
import chalk from 'chalk'
import Router from '@koa/router'
import chokidar from 'chokidar'

import { Command, CommandOptions } from './command'
import { Compiler } from '../compiler'
import { EpubPrinter } from '../printer'
import StandardModule from '../modules/standard'
import { HtmlPrinter } from '../printer/html'

export class ServeCommand implements Command {
  private args: string[]

  constructor({ args }: CommandOptions) {
    this.args = args
  }

  static new(options: CommandOptions): ServeCommand {
    return new ServeCommand(options)
  }

  async run(): Promise<any> {
    const app = new Koa()
    const server = http.createServer(app.callback())
    const router = new Router()
    const wss = new ws.Server({ server })

    const inputPath = path.resolve(process.cwd(), this.args[0])

    router.get('/doc.html', async (ctx) => {
      const compiler = Compiler.new({
        input: {
          file: path.resolve(process.cwd(), this.args[0]),
        },
        target: 'html',
      })

      compiler.generator.registerRootModule(
        new StandardModule()
      )

      compiler.registerPrinter('html', async () =>
        HtmlPrinter.new()
      )

      const outputHtml = await compiler.compile()

      ctx.body = outputHtml
    })

    app
      .use(router.routes())
      .use(router.allowedMethods())
      .use(serve(path.resolve(__dirname, 'assets')))

    wss.on('connection', (ws) => {
      chokidar.watch(inputPath).on('change', async () => {
        ws.send(JSON.stringify({ type: 'reload' }))
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
}
