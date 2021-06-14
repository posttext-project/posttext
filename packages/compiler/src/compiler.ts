/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Parser } from '@posttext/parser'
import { Printer } from '@posttext/printer'
import { Registry } from '@posttext/registry'
import { StdModule } from '@posttext/modules'

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

  getPrinter(): Printer {
    return this.printer
  }
}
