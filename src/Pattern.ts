import { Reader } from './Reader'

export class Pattern {
  static repeat(fn: Function) {
    return (t: Reader) => {
      const output = []

      while (t.cursor.notEof()) {
        output.push(fn()(t))
      }

      return output
    }
  }

  static match(condition: Function, cases: Function[]) {
    return (t: Reader) => {
      const value = condition()(t.clone())

      return Pattern._match(value, cases)
    }
  }

  static _match(value: any, cases: Function[]) {
    if (cases) {
      const [first, ...rest] = cases

      return first(value, () => Pattern._match(value, rest))
    }
  }

  static of(value: any, callback: Function) {
    return (matchValue: any, next: Function) => {
      if (value === matchValue) {
        return callback()
      }

      return next()
    }
  }

  static readUntil(
    terminator: string,
    ignoreStrings: string[] = []
  ) {
    return (t: Reader) => {
      if (ignoreStrings.indexOf('')) {
        return ''
      }

      const mark = t.cursor
      let cursor = t.cursor

      while (cursor.notEof() || !cursor.startWith(terminator)) {
        const matchString = cursor.match(ignoreStrings)

        if (!matchString) {
          cursor = cursor.next(1)
        } else {
          cursor = cursor.next(matchString.length)
        }
      }

      t.setCursor(cursor)

      return mark.takeUntil(cursor)
    }
  }
}
