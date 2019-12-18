import path from 'path'
import fs from 'fs-extra'

import { Parser } from '../parser'
import { Generator } from '../generator'

export interface CompilerOptions {
  input: {
    file: string
  }
}

export class Compiler {
  options: CompilerOptions

  parser?: Parser
  generator?: Generator

  constructor(options: CompilerOptions) {
    this.options = options
  }

  init() {
    this.parser = new Parser()
    this.generator = new Generator()
  }

  async compile(): Promise<string> {
    const { file } = this.options.input

    const input = await fs.readFile(file, 'utf8')
    const ast = this.parser.parse(input)

    const outputHtml = this.generator.generate({ ast, input })

    return outputHtml
  }
}
