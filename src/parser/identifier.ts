import { Cursor } from './cursor'
import { IdentifierNode } from './nodes'

export function parseTagIdentifier(
  cursor: Cursor
): IdentifierNode {
  const mark = cursor.clone()

  while (
    !cursor.oneOf([' ', '(', '[', ':', '{', '=', ';']) &&
    !cursor.isEof()
  ) {
    cursor.next(1)
  }

  if (cursor.startsWith(':')) {
    return {
      type: 'Identifier',
      name: mark.takeUntil(cursor)
    }
  }

  const namespace = mark.takeUntil(cursor)

  cursor.next(1)
  mark.moveTo(cursor)

  while (
    !cursor.oneOf([' ', '(', '[', '{', '=', ';']) &&
    !cursor.isEof()
  ) {
    cursor.next(1)
  }

  const name = mark.takeUntil(cursor)

  return {
    type: 'Identifier',
    name,
    namespace
  }
}

export function parseAttributeIdentifier(
  cursor: Cursor
): IdentifierNode {
  const mark = cursor.clone()

  while (
    !cursor.oneOf([' ', ']', '=', ';', ':']) &&
    !cursor.isEof()
  ) {
    cursor.next(1)
  }

  if (cursor.startsWith(':')) {
    return {
      type: 'Identifier',
      name: mark.takeUntil(cursor)
    }
  }

  const namespace = mark.takeUntil(cursor)

  cursor.next(1)
  mark.moveTo(cursor)

  while (
    !cursor.oneOf([' ', ']', '=', ';']) &&
    !cursor.isEof()
  ) {
    cursor.next(1)
  }

  const name = mark.takeUntil(cursor)

  return {
    type: 'Identifier',
    name,
    namespace
  }
}
