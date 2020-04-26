import fs from 'fs-extra'

import { Parser } from '../parser'
import { Generator } from '../generator'
import { Printer } from '../printer'

export interface CompilerOptions {
  input: {
    file: string
  }
  target: string
}

export interface CompilerStruct {
  options: CompilerOptions
  parser: Parser
  generator: Generator
}

export class Compiler {
  options: CompilerOptions

  parser: Parser
  generator: Generator

  printers: Map<string, () => Promise<Printer<any>>>

  constructor({ options, parser, generator }: CompilerStruct) {
    this.options = options
    this.parser = parser
    this.generator = generator

    this.printers = new Map()
  }

  static new(options: CompilerOptions): Compiler {
    const parser = Parser.new()
    const generator = Generator.new()

    return new Compiler({
      options,
      parser,
      generator,
    })
  }

  registerPrinter(
    target: string,
    printerLoader: () => Promise<Printer<any>>
  ): void {
    this.printers.set(target, printerLoader)
  }

  async compile<T>(): Promise<T | null> {
    const {
      input: { file },
    } = this.options

    const printerLoader:
      | (() => Promise<Printer<any>>)
      | undefined = this.printers.get(this.options.target)

    if (!printerLoader) {
      return null
    }

    const printer = await printerLoader()
    const input = await fs.readFile(file, 'utf8')
    const ast = this.parser.parse(input)

    const command = this.generator.generate({
      ast,
      target: 'html',
    })

    return printer.print({
      rootCommand: command,
    })
  }
}
