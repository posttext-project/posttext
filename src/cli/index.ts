import Koa from 'koa'
import fs from 'fs-extra'
import ws from 'ws'
import dot from 'dot'
import http from 'http'
import meow from 'meow'
import path from 'path'
import boxen from 'boxen'
import chalk from 'chalk'
import Router from '@koa/router'
import chokidar from 'chokidar'

import { Context } from 'koa'
import { Compiler } from '../compiler'

export class CLI {
  cli: meow.Result<any>

  run() {
    this.cli = meow(
      `
        Usage
          $ pt [command] <input>

        Options
          --help, -h    Show this help message.

        Commands
          compile       Build an input file.
          serve         Build and serve an input file.

        Examples
          $ pt serve <input>
          $ pt compile <input>
      `,
      {
        description: false,
        hardRejection: false,
        autoHelp: false
      }
    )

    switch (this.cli?.input?.[0]?.toLowerCase()) {
      case 'compile':
        this.compile()
        return

      case 'serve':
        this.serve()
        return

      default:
        this.cli.showHelp()
    }
  }

  async compile() {
    try {
      const compiler = new Compiler({
        input: {
          file: path.resolve(process.cwd(), this.cli.input[1])
        }
      })
      compiler.init()

      const outputHtml = await compiler.compile()

      const inputPath = path.parse(this.cli.input[1])
      fs.outputFile(
        path.resolve(inputPath.dir, inputPath.name + '.html'),
        outputHtml
      )
    } catch (err) {
      console.log(chalk.red('error') + '  ' + err)
    }
  }

  async serve() {
    const app = new Koa()

    const server = http.createServer(app.callback())
    const wss = new ws.Server({ server })

    const router = new Router()

    const template = await fs.readFile(
      path.resolve(__dirname, 'template.html'),
      'utf8'
    )
    const render = dot.template(template)

    const bundle = await fs.readFile(
      path.resolve(__dirname, 'bundle.js'),
      'utf8'
    )

    const file = path.resolve(process.cwd(), this.cli.input[1])

    router.get('/', async (ctx: Context) => {
      const compiler = new Compiler({
        input: {
          file
        }
      })
      compiler.init()

      const content = await compiler.compile()

      ctx.body = render({
        content
      })
    })

    router.get('/bundle.js', async (ctx: Context) => {
      ctx.type = 'text/javascript'
      ctx.body = bundle
    })

    app.use(router.routes())

    wss.on('connection', ws => {
      chokidar
        .watch(path.resolve(__dirname, file))
        .on('change', async event => {
          const compiler = new Compiler({
            input: {
              file
            }
          })
          compiler.init()

          const content = await compiler.compile()

          ws.send(content)
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
            padding: 1
          }
        )
      )
    })
  }
}
