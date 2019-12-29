import { Cursor } from 'cursornext'
import {
  TextNode,
  TagNode,
  DocumentNode,
  IdentifierNode,
  ParameterNode,
  BlockNode
} from '../ast'

export class Parser {
  static new() {
    return new Parser()
  }

  parse(input: string) {
    const cursor = Cursor.from(input)

    return this.parseDocument(cursor)
  }

  parseDocument(cursor: Cursor): DocumentNode {
    const body: (TagNode | TextNode)[] = []

    while (!cursor.isEof()) {
      const node =
        this.parseTag(cursor) || this.parseText(cursor)

      if (node === null) {
        break
      }

      body.push(node)
    }

    return {
      type: 'Document',
      body
    }
  }

  parseTag(cursor: Cursor): TagNode | null {
    const marker = cursor.clone()

    if (cursor.startsWith('\\')) {
      cursor.next(1)
    } else {
      cursor.moveTo(marker)

      return null
    }

    const id = this.parseIdentifier(cursor)
    if (id === null) {
      cursor.moveTo(marker)

      return null
    }

    this.skip(cursor)

    const params: ParameterNode[] = this.parseParameters(cursor)
    if (!params) {
      cursor.moveTo(marker)

      return null
    }

    this.skip(cursor)

    const blocks: BlockNode[] = []

    while (!cursor.isEof()) {
      const block =
        this.parseVerbatimBlock(cursor) ??
        this.parseBlock(cursor)

      if (block) {
        blocks.push(block)
      } else {
        break
      }

      this.skip(cursor)
    }

    if (cursor.startsWith(';')) {
      cursor.next(1)
    } else {
      cursor.moveTo(marker)

      return null
    }

    return {
      type: 'Tag',
      id,
      params,
      blocks
    }
  }

  parseIdentifier(cursor: Cursor): IdentifierNode | null {
    const execArr = cursor.exec(/[a-zA-Z][a-zA-Z0-9_-]+/gy)

    if (execArr) {
      const name = execArr[0]

      cursor.next(name.length)

      return {
        type: 'Identifier',
        name
      }
    }

    return null
  }

  parseParameters(cursor: Cursor): ParameterNode[] | null {
    if (cursor.startsWith('(')) {
      cursor.next(1)
    } else {
      return []
    }

    const marker = cursor.clone()
    const params: ParameterNode[] = []

    while (!cursor.startsWith(')') && !cursor.isEof()) {
      const param = this.parseParameter(cursor)

      if (param) {
        params.push(param)
      } else {
        break
      }

      if (cursor.startsWith(',')) {
        cursor.next(1)
      } else if (cursor.startsWith(')')) {
        cursor.next(1)

        break
      } else {
        cursor.moveTo(marker)

        return null
      }
    }

    return params
  }

  parseParameter(cursor: Cursor): ParameterNode | null {
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
      type: 'Parameter',
      value: chunks.join('')
    }
  }

  parseBlock(cursor: Cursor): BlockNode {
    const marker = cursor.clone()

    if (cursor.startsWith('{')) {
      cursor.next(1)
    } else {
      cursor.moveTo(marker)

      return null
    }

    const body: (TagNode | TextNode)[] = []
    const tempMarker = cursor.clone()
    while (!cursor.startsWith('}') && !cursor.isEof()) {
      const node =
        this.parseTag(cursor) || this.parseText(cursor)

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
      body
    }
  }

  parseVerbatimBlock(cursor: Cursor): BlockNode | null {
    const marker = cursor.clone()
    const verbatimDecorator = cursor.exec(/=*/gy)[0]

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

    const body: (TagNode | TextNode)[] = []
    const startMarker = cursor.clone()
    const endMarker = cursor.clone()
    do {
      if (cursor.startsWith('}')) {
        endMarker.moveTo(cursor)

        cursor.next(1)

        const execArr = cursor.exec(/=*/gy)
        if (execArr[0].length === verbatimDecorator.length) {
          cursor.next(execArr[0].length)

          body.push({
            type: 'Text',
            value: startMarker.takeUntil(endMarker)
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
      body
    }
  }

  parseText(cursor: Cursor): TextNode | null {
    const execArr = cursor.exec(/[^\\{}]+/gy)

    if (execArr) {
      const value = execArr[0]

      cursor.next(value.length)

      return {
        type: 'Text',
        value
      }
    }

    return null
  }

  skip(cursor: Cursor) {
    const execArr = cursor.exec(/[ \t\r\n]+/gy)

    if (execArr) {
      cursor.next(execArr[0].length)
    }
  }
}
