import { t, Cursor } from 'cursornext'
import yaml from 'js-yaml'
import stripIndent from 'strip-indent'

import {
  Node,
  BlockNode,
  TextNode,
  TagNode,
  DocumentNode,
} from '../../../ast'

export function runParse(
  input: string,
  expected: string,
  callback: (cursor: Cursor) => Node | Node[] | null
): void {
  const iter = t
    .capture(input, {
      noLabel: true,
    })
    .toIter()

  const start = iter.next()
  const end = iter.next()

  const ast = callback(start)

  expect(normalize(ast)).toEqual(yaml.safeLoad(expected))
  expect(start.isAt(end)).toBeTruthy()
}

function normalize<T>(ast: T): T

function normalize(ast: Node | Node[]): Node | Node[] {
  if (Array.isArray(ast)) {
    return ast.map((ast) => normalize(ast))
  }

  switch (ast.type) {
    case 'Document':
      return {
        ...ast,
        body: (ast as DocumentNode).body.map((node) =>
          normalize(node)
        ) as (TextNode | TagNode)[],
      }

    case 'Tag':
      return {
        ...ast,
        blocks: (ast as TagNode).blocks.map((block) =>
          normalize(block)
        ),
      } as TagNode

    case 'Block':
      return {
        ...ast,
        body: (ast as BlockNode).body.map((node) =>
          normalize(node)
        ),
      } as BlockNode

    case 'Text':
      return {
        ...ast,
        value: stripIndent((ast as TextNode).value).trim(),
      }

    default:
      return ast
  }
}
