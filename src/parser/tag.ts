import { ParseOptions } from './root'
import { Cursor } from './cursor'
import {
  TextNode,
  TagNode,
  AttributeNode,
  BlockNode,
  ChildNode
} from './nodes'
import { SPECIAL_CHARACTERS_REGEXP } from './root'
import { parseVerbatimBlock } from './verbatim'
import {
  parseTagIdentifier,
  parseAttributeIdentifier
} from './identifier'

export function parseTag(
  cursor: Cursor,
  options: ParseOptions = {}
): TagNode {
  cursor.next(1)

  const { name, namespace } = parseTagIdentifier(cursor)

  let hasSemi = lookaheadSemicolon(cursor)

  const hasParams = !hasSemi && lookaheadParamaters(cursor)
  const params = hasParams ? parseParameters(cursor) : []

  hasSemi = lookaheadSemicolon(cursor)

  const hasAttrs = !hasSemi && lookaheadAttributes(cursor)
  const attrs = hasAttrs ? parseAttributes(cursor) : []

  hasSemi = lookaheadSemicolon(cursor)

  const body: BlockNode[] = []
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
    name,
    namespace,
    params,
    attrs,
    body
  }
}

export function lookaheadSemicolon(
  cursor: Cursor,
  options: ParseOptions = {}
): boolean {
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

export function lookaheadParamaters(
  cursor: Cursor,
  options: ParseOptions = {}
): boolean {
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

export function parseParameters(
  cursor: Cursor,
  options: ParseOptions = {}
): string[] {
  const params: string[] = []

  do {
    cursor.next(1)

    const marker = cursor.clone()

    while (!cursor.oneOf([',', ')']) && !cursor.isEof()) {
      if (cursor.startsWith('\\')) {
        cursor.next(2)
      } else {
        cursor.next(1)
      }
    }

    const value = marker.takeUntil(cursor)

    params.push(value)
  } while (!cursor.startsWith(')') && !cursor.isEof())

  cursor.next(1)

  return params
}

export function lookaheadAttributes(
  cursor: Cursor,
  options: ParseOptions = {}
): boolean {
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
  cursor: Cursor,
  options: ParseOptions = {}
): AttributeNode[] {
  const attrs: AttributeNode[] = []

  do {
    cursor.next(1)

    const { name, namespace } = parseAttributeIdentifier(cursor)

    let value = ''

    if (cursor.startsWith('=') && !cursor.isEof()) {
      cursor.next(1)

      const marker = cursor.clone()

      while (!cursor.oneOf([';', ']']) && !cursor.isEof()) {
        if (cursor.startsWith('\\')) {
          cursor.next(2)
        } else {
          cursor.next(1)
        }
      }

      value = marker.takeUntil(cursor)
    }

    attrs.push({
      type: 'Attribute',
      name,
      namespace,
      value
    })
  } while (!cursor.startsWith(']') && !cursor.isEof())

  cursor.next(1)

  return attrs
}

export function lookaheadBlock(
  cursor: Cursor,
  options: ParseOptions = {}
): boolean {
  const lookahead = cursor.clone()

  while (lookahead.startsWith(' ') && !lookahead.isEof()) {
    lookahead.next(1)
  }

  const marker = lookahead.clone()

  while (lookahead.startsWith('=') && !lookahead.isEof()) {
    lookahead.next(1)
  }

  if (lookahead.startsWith('{')) {
    cursor.moveTo(marker)

    return true
  }

  return false
}

export function parseBlock(
  cursor: Cursor,
  options: ParseOptions = {}
): BlockNode {
  if (cursor.startsWith('=')) {
    return parseVerbatimBlock(cursor)
  }

  return parseNormalBlock(cursor)
}

export function parseNormalBlock(
  cursor: Cursor,
  options: ParseOptions = {}
): BlockNode {
  const body: ChildNode[] = []

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

export function parseBlockTextNode(
  cursor: Cursor,
  options: ParseOptions = {}
): TextNode {
  const marker = cursor.clone()

  while (
    !cursor.startsWith('\\') &&
    !cursor.startsWith('}') &&
    !cursor.isEof()
  ) {
    cursor.next(1)
  }

  const value = marker
    .takeUntil(cursor)
    .split(SPECIAL_CHARACTERS_REGEXP)
    .join('')

  return {
    type: 'Text',
    value
  }
}
