/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import fs from 'fs-extra'
import url from 'url'
import path from 'path'
import { findUpMultiple } from 'find-up'
import { Compiler } from '@posttext/compiler'
import { importMeta, StdModule } from '@posttext/modules'
import { getInterpreters } from '@posttext/interpreters/web'

import { CommandOptions, Command } from './command.js'

interface CompileCommand {
  run(): Promise<void>
}

export function createCompileCommand(
  options: CommandOptions
): CompileCommand {
  return {
    run: (): Promise<void> => run(options.args),
  }
}

async function run(args: string[]): Promise<void> {
  const inputPath = path.resolve(process.cwd(), args[0])
  const outputPath = path.resolve(process.cwd(), 'dist')
  const input = await fs.readFile(inputPath, 'utf8')

  const compiler = Compiler.create()

  const pathsToNodeModules = await findUpMultiple(
    'node_modules',
    {
      cwd: url.fileURLToPath(importMeta.url),
      type: 'directory',
    }
  )

  compiler
    .getPrinter()
    .getRegistry()
    .loadModule(StdModule.create())
  compiler.getPrinter().registerInterpreters(
    getInterpreters({
      output: outputPath,
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
      resolve: {
        modules: [
          path.resolve(
            path.dirname(url.fileURLToPath(import.meta.url)),
            '../node_modules'
          ),
          ...(pathsToNodeModules ? pathsToNodeModules : []),
        ],
      },
    })
  )

  await compiler.compile(input)
}
