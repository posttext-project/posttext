import { Cursor } from './cursor'
import {
  IdentifierNode,
  TextNode,
  TagNode,
  AttributeNode,
  BlockNode,
  BlockChildNode
} from './nodes'
import { SPECIAL_CHARACTERS_REGEXP } from './root'
import { parseVerbatimBlock } from './verbatim'

export function parseTag(cursor: Cursor): TagNode {
  cursor.next(1)

  const identifier = parseTagIdentifier(cursor)

  let hasSemi = lookaheadSemicolon(cursor)

  const hasParams = !hasSemi && lookaheadParamaters(cursor)
  const params = hasParams ? parseParameters(cursor) : []

  hasSemi = lookaheadSemicolon(cursor)

  const hasAttrs = !hasSemi && lookaheadAttributes(cursor)
  const attrs = hasAttrs ? parseAttributes(cursor) : []

  hasSemi = lookaheadSemicolon(cursor)

  let body = []
  if (!hasSemi) {
    while (!cursor.isEof()) {
      const hasMoreBlock = lookaheadBlock(cursor)

      if (hasMoreBlock) {
        const block = parseBlock(cursor)

        body.push(block)
      } else {
        break
      }
    }
  }

  return {
    type: 'Tag',
    id: identifier,
    params,
    attrs,
    body
  }
}

export function lookaheadSemicolon(cursor: Cursor): boolean {
  const lookahead = cursor.clone()

  while (lookahead.startsWith(' ') && !lookahead.isEof()) {
    lookahead.next(1)
  }

  if (lookahead.startsWith(';')) {
    lookahead.next(1)
    cursor.moveTo(lookahead)

    return true
  }

  return false
}

export function parseTagIdentifier(
  cursor: Cursor
): IdentifierNode {
  const mark = cursor.clone()

  while (
    !cursor.oneOf([' ', '(', '=', '[', ';']) &&
    !cursor.isEof()
  ) {
    cursor.next(1)
  }

  const name = mark.takeUntil(cursor)

  return {
    type: 'Identifier',
    name
  }
}

export function lookaheadParamaters(cursor: Cursor): boolean {
  const lookahead = cursor.clone()

  while (lookahead.startsWith(' ') && !lookahead.isEof()) {
    lookahead.next(1)
  }

  if (lookahead.startsWith('(')) {
    cursor.moveTo(lookahead)

    return true
  }

  return false
}

export function parseParameters(cursor: Cursor): TextNode[] {
  const params: TextNode[] = []

  do {
    cursor.next(1)

    const mark = cursor.clone()

    while (!cursor.oneOf([',', ')']) && !cursor.isEof()) {
      if (cursor.startsWith('\\')) {
        cursor.next(2)
      } else {
        cursor.next(1)
      }
    }

    const value = mark.takeUntil(cursor)

    params.push({
      type: 'Text',
      value
    })
  } while (!cursor.startsWith(')') && !cursor.isEof())

  cursor.next(1)

  return params
}

export function lookaheadAttributes(cursor: Cursor): boolean {
  const lookahead = cursor.clone()

  while (lookahead.startsWith(' ') && !lookahead.isEof()) {
    lookahead.next(1)
  }

  if (lookahead.startsWith('[')) {
    cursor.moveTo(lookahead)

    return true
  }

  return false
}

export function parseAttributes(
  cursor: Cursor
): AttributeNode[] {
  const attrs: AttributeNode[] = []

  do {
    cursor.next(1)

    const mark = cursor.clone()

    while (!cursor.oneOf(['=', ';', ']']) && !cursor.isEof()) {
      if (cursor.startsWith('\\')) {
        cursor.next(2)
      } else {
        cursor.next(1)
      }
    }

    const name = mark.takeUntil(cursor)

    let value = ''

    if (cursor.startsWith('=') && !cursor.isEof()) {
      cursor.next(1)

      mark.moveTo(cursor)

      while (!cursor.oneOf([';', ']']) && !cursor.isEof()) {
        if (cursor.startsWith('\\')) {
          cursor.next(2)
        } else {
          cursor.next(1)
        }
      }

      value = mark.takeUntil(cursor)
    }

    attrs.push({
      type: 'Attribute',
      id: {
        type: 'Identifier',
        name
      },
      value: {
        type: 'Text',
        value
      }
    })
  } while (!cursor.startsWith(']') && !cursor.isEof())

  cursor.next(1)

  return attrs
}

export function lookaheadBlock(cursor: Cursor): boolean {
  const lookahead = cursor.clone()

  while (lookahead.startsWith(' ') && !lookahead.isEof()) {
    lookahead.next(1)
  }

  const mark = lookahead.clone()

  while (lookahead.startsWith('=') && !lookahead.isEof()) {
    lookahead.next(1)
  }

  if (lookahead.startsWith('{')) {
    cursor.moveTo(mark)

    return true
  }

  return false
}

export function parseBlock(cursor: Cursor): BlockNode {
  if (cursor.startsWith('=')) {
    return parseVerbatimBlock(cursor)
  }

  return parseNormalBlock(cursor)
}

export function parseNormalBlock(cursor: Cursor): BlockNode {
  const body: BlockChildNode[] = []

  while (!cursor.startsWith('}') && !cursor.isEof()) {
    if (cursor.startsWith('\\')) {
      const tag = parseTag(cursor)

      body.push(tag)
    } else {
      const textNode = parseBlockTextNode(cursor)

      body.push(textNode)
    }
  }

  cursor.next(1)

  return {
    type: 'Block',
    verbatim: false,
    body
  }
}

export function parseBlockTextNode(cursor: Cursor): TextNode {
  const mark = cursor.clone()

  while (
    !cursor.startsWith('\\') &&
    !cursor.startsWith('}') &&
    !cursor.isEof()
  ) {
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
