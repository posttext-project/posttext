import fs from 'fs-extra'

import { Parser } from '../parser'
import { Printer } from '../printer'

export interface CompilerOptions {
  input: {
    file: string
  }
}

export interface CompilerComponents {
  parser: Parser
  printer: Printer
}

export class Compiler {
  private parser: Parser
  private printer: Printer

  constructor({ parser, printer }: CompilerComponents) {
    this.parser = parser
    this.printer = printer
  }

  static new({
    parser,
    printer,
  }: CompilerComponents): Compiler {
    return new Compiler({
      parser,
      printer,
    })
  }

  async compile(options: CompilerOptions): Promise<any> {
    const {
      input: { file },
    } = options

    const input = await fs.readFile(file, 'utf8')
    const ast = this.parser.parse(input)

    return this.printer.print({
      ast,
    })
  }
}
