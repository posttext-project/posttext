import { Cursor } from '../cursor'
import {
  DocumentNode,
  TextNode,
  DocumentChildNode
} from './nodes'
import { parseMacro } from './macro'

export const SPECIAL_CHARACTERS = ['=', '{', '}']
export const SPECIAL_CHARACTERS_REGEXP = new RegExp(
  `[${SPECIAL_CHARACTERS.join()}]+`,
  'g'
)

export function parse(doc: string): DocumentNode {
  const cursor = Cursor.from({ doc })

  const body: DocumentChildNode[] = []

  while (!cursor.isEof()) {
    if (cursor.startsWith('\\')) {
      const macro = parseMacro(cursor)

      body.push(macro)
    } else {
      const textNode = parseTopLevelTextNode(cursor)

      body.push(textNode)
    }
  }

  return {
    type: 'Document',
    body
  }
}

export function parseTopLevelTextNode(
  cursor: Cursor
): TextNode {
  const mark = cursor.clone()

  while (!cursor.startsWith('\\') && !cursor.isEof()) {
    cursor.next(1)
  }

  const value = mark
    .takeUntil(cursor)
    .split(SPECIAL_CHARACTERS_REGEXP)
    .join('')

  return {
    type: 'TextNode',
    value
  }
}
