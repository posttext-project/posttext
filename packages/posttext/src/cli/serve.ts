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
import { findUpMultiple } from 'find-up'
import Router from '@koa/router'
import chokidar from 'chokidar'
import url from 'url'
import { Subject } from 'rxjs'
import { Compiler } from '@posttext/compiler'
import { importMeta, StdModule } from '@posttext/modules'
import { getInterpreters } from '@posttext/interpreters/web'

import { Command, CommandOptions } from './command.js'
import { Logger } from './helpers/logger.js'
import { createBuilder } from '../web/builder'

export interface ServeCommand {
  run(): Promise<void>
}

export function createServeCommand(
  options: CommandOptions
): ServeCommand {
  return {
    run: (): Promise<void> => run(options.args),
  }
}

async function run(args: string[]): Promise<void> {
  const app = new Koa()
  const server = http.createServer(app.callback())
  const router = new Router()
  const wss = new ws.Server({ server })

  const inputPath = path.resolve(process.cwd(), args[0])
  const outputPath = path.resolve(process.cwd(), 'dist')

  const reload$ = new Subject<boolean>()

  await createBuilder().build()

  app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve(outputPath))

  chokidar.watch(inputPath).on('change', async () => {
    try {
      console.log(
        `Starting compiling ${chalk.blue(`'${args[0]}'`)}`
      )
      const startTime = new Date()

      await (inputPath, outputPath)

      const endTime = new Date()

      console.log(
        `Finished compiling ${chalk.blue(
          `'${args[0]}'`
        )} after ${chalk.magenta(
          `${(
            (endTime.getTime() - startTime.getTime()) /
            1000
          ).toPrecision(2)} s`
        )}`
      )

      console.log(`Reloading ${chalk.blue(`'${args[0]}'`)}`)

      reload$.next(true)
    } catch (error) {
      console.log(chalk.bgRed(' ERROR '), error)
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
