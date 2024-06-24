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
import { Renderer, createRenderer } from '../renderer'
import { Parser, createParser } from '../parser'
import { createHelperList } from '../helperList'
import { ModuleDefinition } from '../module'
import { createScope } from '../scope'
import { Builder, BuilderDefinition } from '../builder'

export interface Web {
  build(): Promise<void>
}

export type BuilderFactory = () => Web

export function createBuilderFactory(): BuilderFactory {
  return createBuilder
}

export function createBuilder(): Builder {
  const moduleDefinitionMap: Record<string, ModuleDefinition> =
    {}

  const parser = createParser()
  const renderer = createRenderer({
    helpers: createHelperList({}),
    scope: createScope(moduleDefinitionMap),
  })

  return {
    build: (): Promise<void> => build(parser, renderer),
    serve: (): Promise<void> => watch(parser, renderer),
  } as Builder
}

const DEFAULT_INPUT_FILE = './index.pt'

async function build(
  parser: Parser,
  renderer: Renderer
): Promise<void> {
  const input = await fs.readFile(DEFAULT_INPUT_FILE, 'utf-8')

  const ast = parser.parse(input)
  const html = await renderer.renderToString(ast)

  await fs.writeFile('index.html', html)
}

async function watch(
  parser: Parser,
  renderer: Renderer
): Promise<void> {
  const app = new Koa()
  const server = http.createServer(app.callback())
  const router = new Router()
  const wss = new ws.Server({ server })

  const inputPath = path.resolve(
    process.cwd(),
    DEFAULT_INPUT_FILE
  )
  const outputPath = path.resolve(process.cwd(), 'dist')

  const input = await fs.readFile(DEFAULT_INPUT_FILE, 'utf-8')

  const ast = parser.parse(input)
  const html = await renderer.renderToString(ast)

  await fs.writeFile('index.html', html)

  const reload$ = new Subject<boolean>()

  app
    .use(router.routes())
    .use(router.allowedMethods())
    .use(serve(outputPath))

  chokidar.watch(inputPath).on('change', async () => {
    try {
      console.log(
        `Starting compiling ${chalk.blue(
          `'${DEFAULT_INPUT_FILE}'`
        )}`
      )
      const startTime = new Date()

      const inputPath = path.resolve(
        process.cwd(),
        DEFAULT_INPUT_FILE
      )
      const outputPath = path.resolve(process.cwd(), 'dist')

      const input = await fs.readFile(
        DEFAULT_INPUT_FILE,
        'utf-8'
      )

      const ast = parser.parse(input)
      const html = await renderer.renderToString(ast)

      await fs.writeFile('index.html', html)

      const endTime = new Date()

      console.log(
        `Finished compiling ${chalk.blue(
          `'${DEFAULT_INPUT_FILE}'`
        )} after ${chalk.magenta(
          `${(
            (endTime.getTime() - startTime.getTime()) /
            1000
          ).toPrecision(2)} s`
        )}`
      )

      console.log(
        `Reloading ${chalk.blue(`'${DEFAULT_INPUT_FILE}'`)}`
      )

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

export default {
  name: 'web',
  builderFactory: createBuilderFactory(),
} as BuilderDefinition
