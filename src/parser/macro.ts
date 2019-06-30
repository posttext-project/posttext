import { Cursor } from '../cursor'
import {
  IdentifierNode,
  TextNode,
  MacroNode,
  MacroAttributeNode,
  BlockNode,
  BlockChildNode
} from './nodes'
import { SPECIAL_CHARACTERS_REGEXP } from './parse'
import { parseVerbatimBlock } from './verbatim'

export function parseMacro(cursor: Cursor): MacroNode {
  cursor.next(1)

  const identifier = parseMacroIdentifier(cursor)

  const hasParams = lookaheadMacroParamaters(cursor)
  const params = hasParams ? parseMacroParameters(cursor) : []

  const hasAttrs = lookaheadMacroAttributes(cursor)
  const attrs = hasAttrs ? parseMacroAttributes(cursor) : []

  let body = []
  do {
    const hasMoreBlock = lookaheadBlock(cursor)

    if (hasMoreBlock) {
      const block = parseBlock(cursor)

      body.push(block)
    } else {
      break
    }
  } while (!cursor.isEof())

  return {
    type: 'Macro',
    id: identifier,
    params,
    attrs,
    body
  }
}

export function parseMacroIdentifier(
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

export function lookaheadMacroParamaters(
  cursor: Cursor
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

export function parseMacroParameters(
  cursor: Cursor
): TextNode[] {
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
      type: 'TextNode',
      value
    })
  } while (!cursor.startsWith(')') && !cursor.isEof())

  cursor.next(1)

  return params
}

export function lookaheadMacroAttributes(
  cursor: Cursor
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

export function parseMacroAttributes(
  cursor: Cursor
): MacroAttributeNode[] {
  const attrs: MacroAttributeNode[] = []

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
      type: 'MacroAttribute',
      id: {
        type: 'Identifier',
        name
      },
      value: {
        type: 'TextNode',
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
      const macro = parseMacro(cursor)

      body.push(macro)
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
    type: 'TextNode',
    value
  }
}
