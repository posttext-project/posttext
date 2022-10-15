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
import Router from '@koa/router'
import chokidar from 'chokidar'
import { Subject } from 'rxjs'
import { Compiler, Registry } from '@posttext/posttext'

import { Command, CommandOptions } from './command.js'
import StdPackage from '@posttext/package-std'

export class ServeCommand implements Command {
  private args: string[]

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

    const url = 'http://localhost:8080'

    await this.build(inputPath, outputPath)

    app
      .use(router.routes())
      .use(router.allowedMethods())
      .use(serve(outputPath))

    chokidar.watch(inputPath).on('change', async () => {
      try {
        await this.build(inputPath, outputPath)

        reload$.next(true)
      } catch (error) {
        console.log(error)
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
        boxen(`${chalk.yellow('serve')}      ${url}`, {
          borderColor: 'yellow',
          margin: 1,
          padding: 1,
        })
      )
    })
  }

  private async build(
    inputPath: string,
    outputPath: string
  ): Promise<void> {
    try {
      const input = await fs.readFile(inputPath, 'utf8')

      const registry = new Registry()
      registry.addPackage('std', new StdPackage())

      const compiler = Compiler.create({
        registry,
        plugins: [],
      })

      const htmlResult = await compiler.compile(input)

      await fs.writeFile(outputPath, htmlResult.html)
    } catch (err) {
      console.log(err)
    }
  }
}
