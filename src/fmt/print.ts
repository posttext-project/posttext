import { Node } from '../parser';

export interface PrintOptions {
  indent: number
}

export function print(ast: Node, options: PrintOptions) {
  if (ast.type === 'Document') {
    return ast.body.join('')
  }
}
