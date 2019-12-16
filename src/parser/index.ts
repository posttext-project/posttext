import { Cursor } from 'cursornext'
import {
  TextNode,
  TagNode,
  DocumentNode,
  IdentifierNode,
  Node
} from '../ast'

export class Parser {
  parse(input: string) {
    const cursor = Cursor.from(input)

    return this.parseDocument(cursor)
  }

  parseDocument(cursor: Cursor): DocumentNode {
    const body: Node[] = []

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

    if (cursor.startsWith('{')) {
      cursor.next(1)
    } else {
      cursor.moveTo(marker)

      return null
    }

    const children: Node[] = []
    const tempMarker = cursor.clone()
    while (!cursor.startsWith('}') && !cursor.isEof()) {
      const node =
        this.parseTag(cursor) || this.parseText(cursor)

      if (node === null) {
        cursor.moveTo(tempMarker)

        break
      }

      children.push(node)
      tempMarker.moveTo(cursor)
    }

    if (cursor.startsWith('}')) {
      cursor.next(1)
    } else {
      cursor.moveTo(marker)

      return null
    }

    this.skip(cursor)

    if (cursor.startsWith(';')) {
      cursor.next(1)
    } else {
      cursor.moveTo(marker)

      return null
    }

    return {
      type: 'Tag',
      id,
      children
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
