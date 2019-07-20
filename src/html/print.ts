import { Printer, PrintOptions } from './printer'

export function print(ast: Node, options: PrintOptions): string {
  const printer = new Printer()

  return printer.print(ast, options)
}
