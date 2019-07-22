import { Printer, PrintOptions } from './printer'
import { DocumentNode } from '../parser'

export function print(
  ast: DocumentNode,
  options: PrintOptions
): string {
  const printer = new Printer()

  return printer.print(ast, options)
}
