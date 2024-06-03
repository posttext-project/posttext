/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cursor } from 'cursornext'
import {
  Text,
  Tag,
  Document as Node,
  Identifier,
  Argument,
  Block,
  Attribute,
} from './ast.js'

export interface Parser {
  parse(input: string): Node
}

export function createParser(): Parser {
  return {
    parse: (input: string): Node => parse(new Cursor(input)),
  }
}

function parse(cursor: Cursor): Node {
  return parseDocument(cursor)
}

function parseDocument(cursor: Cursor): Node {
  const body: (Tag | Text)[] = []

  while (!cursor.isEof()) {
    const node = parseTag(cursor) || parseText(cursor)

    if (node === null) {
      break
    }

    body.push(node)
  }

  return {
    type: 'Document',
    body,
  }
}

function parseTag(cursor: Cursor): Tag | null {
  const marker = cursor.clone()

  if (cursor.startsWith('\\')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  const id = parseIdentifier(cursor)
  if (id === null) {
    cursor.moveTo(marker)

    return null
  }

  skip(cursor)

  const args: Argument[] | null = parseArguments(cursor)
  if (!args) {
    cursor.moveTo(marker)

    return null
  }

  skip(cursor)

  const attributes: Attribute[] | null = parseAttributes(cursor)
  if (!attributes) {
    cursor.moveTo(marker)

    return null
  }

  const blocks: Block[] = []

  while (!cursor.isEof()) {
    const block =
      parseVerbatimBlock(cursor) ?? parseBlock(cursor)

    if (block) {
      blocks.push(block)
    } else {
      break
    }

    skip(cursor)
  }

  if (cursor.startsWith(';')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  return {
    type: 'Tag',
    identifier: id,
    arguments: args,
    attributes,
    blocks,
  }
}

function parseIdentifier(cursor: Cursor): Identifier | null {
  const execArr = cursor.exec(/[a-zA-Z][a-zA-Z0-9_'-]+/gy)

  if (execArr) {
    const name = execArr[0]

    cursor.next(name.length)

    return {
      type: 'Identifier',
      name,
    }
  }

  return null
}

function parseArguments(cursor: Cursor): Argument[] | null {
  if (cursor.startsWith('(')) {
    cursor.next(1)
  } else {
    return []
  }

  const marker = cursor.clone()
  const args: Argument[] = []

  if (cursor.startsWith(')')) {
    cursor.next(1)

    return args
  }

  const param = parseArgument(cursor)
  if (param) {
    args.push(param)
  } else {
    cursor.moveTo(marker)

    return null
  }

  while (!cursor.startsWith(')') && !cursor.isEof()) {
    if (cursor.startsWith(',')) {
      cursor.next(1)
    } else {
      cursor.moveTo(marker)

      return null
    }

    const param = parseArgument(cursor)
    if (param) {
      args.push(param)
    } else {
      cursor.moveTo(marker)

      return null
    }
  }

  if (cursor.startsWith(')')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  return args
}

function parseArgument(cursor: Cursor): Argument | null {
  const chunks: string[] = []

  if (
    cursor.startsWith(')') ||
    cursor.startsWith('(') ||
    cursor.startsWith(',')
  ) {
    return null
  }

  const tempMarker = cursor.clone()
  while (
    !cursor.startsWith(')') &&
    !cursor.startsWith('(') &&
    !cursor.startsWith(',') &&
    !cursor.isEof()
  ) {
    if (cursor.startsWith('\\')) {
      chunks.push(tempMarker.takeUntil(cursor))
      cursor.next(1)

      if (cursor.startsWith(')')) {
        chunks.push(')')
      } else if (cursor.startsWith('(')) {
        chunks.push('(')
      } else if (cursor.startsWith(',')) {
        chunks.push(',')
      } else {
        chunks.push('\\' + cursor.lookahead(1))
      }

      cursor.next(1)
      tempMarker.moveTo(cursor)
    } else {
      cursor.next(1)
    }
  }

  chunks.push(tempMarker.takeUntil(cursor))

  return {
    type: 'Argument',
    value: {
      type: 'Literal',
      value: chunks.join('').trim(),
    },
  }
}

function parseAttributes(cursor: Cursor): Attribute[] | null {
  if (cursor.startsWith('[')) {
    cursor.next(1)
  } else {
    return []
  }

  const marker = cursor.clone()

  skip(cursor)

  const attributes: Attribute[] = []
  if (cursor.startsWith(']')) {
    cursor.next(1)

    return attributes
  }

  const attr = parseAttribute(cursor)
  if (!attr) {
    cursor.moveTo(marker)

    return null
  }

  attributes.push(attr)

  skip(cursor)

  while (!cursor.startsWith(']') && !cursor.isEof()) {
    if (!cursor.startsWith(';')) {
      cursor.moveTo(marker)

      return null
    }

    cursor.next(1)

    skip(cursor)

    if (cursor.startsWith(']')) {
      break
    }

    const attr = parseAttribute(cursor)
    if (!attr) {
      cursor.moveTo(marker)

      return null
    }

    attributes.push(attr)

    skip(cursor)
  }

  if (cursor.startsWith(']')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  return attributes
}

function parseAttribute(cursor: Cursor): Attribute | null {
  const marker = cursor.clone()

  skip(cursor)

  const id = parseIdentifier(cursor)
  if (!id) {
    cursor.moveTo(marker)

    return null
  }

  skip(cursor)

  if (cursor.startsWith('=')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  skip(cursor)

  const value = parseAttributeValue(cursor)
  if (!value) {
    cursor.moveTo(marker)

    return null
  }

  return {
    type: 'Attribute',
    identifier: id,
    value: {
      type: 'Literal',
      value,
    },
  }
}

function parseAttributeValue(cursor: Cursor): string | null {
  const marker = cursor.clone()

  const chunks: string[] = []
  const tempMarker = cursor.clone()
  while (
    !cursor.startsWith(';') &&
    !cursor.startsWith(']') &&
    !cursor.startsWith('[') &&
    !cursor.isEof()
  ) {
    if (cursor.startsWith('\\')) {
      chunks.push(tempMarker.takeUntil(cursor))

      cursor.next(1)

      if (cursor.startsWith('\\')) {
        chunks.push('\\')
      } else if (cursor.startsWith(';')) {
        chunks.push(';')
      } else if (cursor.startsWith('=')) {
        chunks.push('=')
      } else if (cursor.startsWith('[')) {
        chunks.push('[')
      } else if (cursor.startsWith(']')) {
        chunks.push(']')
      } else {
        cursor.moveTo(marker)

        return null
      }

      chunks.push(tempMarker.takeUntil(cursor))

      cursor.next(1)
    } else {
      cursor.next(1)
    }
  }

  if (!cursor.startsWith(';') && !cursor.startsWith(']')) {
    cursor.moveTo(marker)

    return null
  }

  chunks.push(tempMarker.takeUntil(cursor))

  return chunks.join('')
}

function parseBlock(cursor: Cursor): Block | null {
  const marker = cursor.clone()

  if (cursor.startsWith('{')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  const body: (Tag | Text)[] = []
  const tempMarker = cursor.clone()
  while (!cursor.startsWith('}') && !cursor.isEof()) {
    const node = parseTag(cursor) || parseText(cursor)

    if (node === null) {
      cursor.moveTo(tempMarker)

      break
    }

    body.push(node)
    tempMarker.moveTo(cursor)
  }

  if (cursor.startsWith('}')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  return {
    type: 'Block',
    body,
  }
}

function parseVerbatimBlock(cursor: Cursor): Block | null {
  const marker = cursor.clone()
  const verbatimDecorator = cursor.exec(/=*/gy)?.[0] ?? []

  if (verbatimDecorator.length === 0) {
    return null
  } else {
    cursor.next(verbatimDecorator.length)
  }

  if (cursor.startsWith('{')) {
    cursor.next(1)
  } else {
    cursor.moveTo(marker)

    return null
  }

  const body: (Tag | Text)[] = []
  const startMarker = cursor.clone()
  const endMarker = cursor.clone()
  do {
    if (cursor.startsWith('}')) {
      endMarker.moveTo(cursor)

      cursor.next(1)

      const execArr = cursor.exec(/=*/gy)
      if (execArr![0].length === verbatimDecorator.length) {
        cursor.next(execArr![0].length)

        body.push({
          type: 'Text',
          value: startMarker.takeUntil(endMarker),
        })

        break
      }

      continue
    }

    cursor.next(1)

    if (cursor.isEof()) {
      cursor.moveTo(marker)

      return null
    }
  } while (!cursor.isEof())

  return {
    type: 'Block',
    body,
  }
}

function parseText(cursor: Cursor): Text | null {
  const execArr = cursor.exec(/[^\\{}]+/gy)

  if (execArr) {
    const value = execArr[0]

    cursor.next(value.length)

    return {
      type: 'Text',
      value,
    }
  }

  return null
}

function skip(cursor: Cursor): void {
  const execArr = cursor.exec(/[ \t\r\n]+/gy)

  if (execArr) {
    cursor.next(execArr[0].length)
  }
}
