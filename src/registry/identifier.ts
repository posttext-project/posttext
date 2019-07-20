import { Cursor } from '../parser'

export function resolveIdentifier(
  tagIdentifier: string
): [string | false, string] {
  let cursor = Cursor.from({ doc: tagIdentifier })
  let lookahead = cursor.clone()

  let namespace: false | string = false

  while (!lookahead.isEof()) {
    if (lookahead.startsWith('\\')) {
      lookahead.next(2)
    } else if (lookahead.startsWith(':')) {
      namespace = cursor.takeUntil(lookahead)
      lookahead.next(1)
    } else {
      lookahead.next(1)
    }
  }

  if (!namespace) {
    return [false, tagIdentifier]
  }

  return [namespace, lookahead.takeUntil(lookahead.endIndex())]
}
