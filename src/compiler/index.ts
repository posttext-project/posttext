import { Parser } from '../parser'
import { Printer } from '../printer'
import { Registry } from '../registry'
import StdModule from '../modules/std'

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

  static create(): Compiler {
    const parser = Parser.create()

    const registry = Registry.create({
      rootModule: new StdModule(),
    })
    const printer = Printer.create({
      registry,
    })

    return new Compiler({
      parser,
      printer,
    })
  }

  async compile(input: string): Promise<any> {
    const ast = this.parser.parse(input)

    return this.printer.print({
      ast,
    })
  }
}
