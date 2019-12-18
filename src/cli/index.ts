import Koa from 'koa'
import fs from 'fs-extra'
import meow from 'meow'
import path from 'path'
import chalk from 'chalk'

import { Compiler } from '../compiler'
import { Context } from 'koa'

export class Cli {
  cli: meow.Result<any>

  init() {
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
      console.log(chalk.red('error'), err)
    }
  }

  serve() {
    const app = new Koa()

    app.use(async (ctx: Context) => {
      const compiler = new Compiler({
        input: {
          file: path.resolve(process.cwd(), this.cli.input[1])
        }
      })
      compiler.init()

      ctx.body = await compiler.compile()
    })

    app.listen(8080, () => {
      console.log(
        '\n    ',
        chalk.yellow('serve'),
        '    http://localhost:8080\n'
      )
    })
  }
}
