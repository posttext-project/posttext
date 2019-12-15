import { Cursor } from './cursor'
import { BlockNode, ChildNode } from './nodes'
import { ParseOptions } from './root'

export function parseVerbatimBlock(
  cursor: Cursor,
  options: ParseOptions = {}
): BlockNode {
  /**
   * ```
   * \code(md) ==={ Hello, World! }===
   *               ^
   *               cursor
   * ```
   */
  let verbatimPrefix = 0
  const body: ChildNode[] = []

  while (cursor.startsWith('=') && !cursor.isEof()) {
    cursor.next(1)
    ++verbatimPrefix
  }

  cursor.next(1)

  /**
   * ```
   * \code(md) ==={ Hello, World! }===
   *               ^
   *               cursor
   * ```
   */
  const marker = cursor.clone()

  while (!cursor.isEof()) {
    if (cursor.startsWith('}')) {
      const lookahead = cursor.clone()

      lookahead.next(1)

      const verbatimPostfix = verbatimPostfixLevel(lookahead)

      if (verbatimPrefix === verbatimPostfix) {
        /**
         * ```
         * \code(md) ==={ Hello, World! }===
         *               ^              ^   ^
         *               marker         |   lookahead
         *                              cursor
         * ```
         */
        if (marker.index !== cursor.index) {
          const value = marker.takeUntil(cursor)

          body.push({
            type: 'Text',
            value
          })
        }

        cursor.moveTo(lookahead)
        marker.moveTo(cursor)
        /**
         * ```
         * \code(md) ==={ Hello, World! }===
         *                                  ^
         *                                  lookahead
         *                                  cursor
         *                                  marker
         * ```
         */

        break
      } else {
        cursor.moveTo(lookahead)
      }
    } else {
      cursor.next(1)
    }
  }

  if (marker.index !== cursor.index) {
    /**
     * ```
     * \code(md) ==={ Hello, World!
     *               ^             ^
     *               marker        EOF
     *                             cursor
     * ```
     */
    const value = marker.takeUntil(cursor)

    body.push({
      type: 'Text',
      value
    })
  }

  return {
    type: 'Block',
    verbatim: true,
    body
  }
}

export function verbatimPostfixLevel(
  cursor: Cursor,
  options: ParseOptions = {}
) {
  let verbatimPostfix = 0

  while (cursor.startsWith('=') && !cursor.isEof()) {
    ++verbatimPostfix
    cursor.next(1)
  }

  return verbatimPostfix
}
