import { Printer, PrintOptions } from './printer'
import { PTDocument } from '../parser'

export function print(
  ast: PTDocument,
  options: PrintOptions
): string {
  const printer = new Printer()

  return printer.print(ast, options)
}
