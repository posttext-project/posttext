import { Cursor } from './cursor'
import {
  DocumentNode,
  TextNode,
  DocumentChildNode
} from './nodes'
import { parseTag } from './tag'

export interface ParseOptions {}

export const SPECIAL_CHARACTERS = ['=', '{', '}']
export const SPECIAL_CHARACTERS_REGEXP = new RegExp(
  `[${SPECIAL_CHARACTERS.join()}]+`,
  'g'
)

export function parse(
  doc: string,
  options: ParseOptions
): DocumentNode {
  const cursor = Cursor.from({ doc })

  const body: DocumentChildNode[] = []

  while (!cursor.isEof()) {
    if (cursor.startsWith('\\')) {
      const tag = parseTag(cursor)

      body.push(tag)
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
  cursor: Cursor,
  options: ParseOptions = {}
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
    type: 'Text',
    value
  }
}
