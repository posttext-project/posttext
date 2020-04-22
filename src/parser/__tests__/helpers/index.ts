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
) {
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
        body: <(TextNode | TagNode)[]>(
          (<DocumentNode>ast).body.map((node) =>
            normalize(node)
          )
        ),
      }

    case 'Tag':
      return <TagNode>{
        ...ast,
        blocks: (<TagNode>ast).blocks.map((block) =>
          normalize(block)
        ),
      }

    case 'Block':
      return <BlockNode>{
        ...ast,
        body: (<BlockNode>ast).body.map((node) =>
          normalize(node)
        ),
      }

    case 'Text':
      return {
        ...ast,
        value: stripIndent((<TextNode>ast).value).trim(),
      }

    default:
      return ast
  }
}
