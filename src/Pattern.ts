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

  static repeatUntil(condition: Function, fn: Function) {
    return (t: Reader) => {
      const output = []

      while (t.cursor.notEof() && condition()(t)) {
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

  static skip(count: number) {
    return (t: Reader) => {
      t.setCursor(t.cursor.next(count))
    }
  }

  static skipUntilRegExp(terminator: RegExp) {
    return (t: Reader) => {
      const cursor = t.cursor
      let result = cursor.findRegExp(terminator)
      let index = (result && result.index) || undefined

      t.setCursor(cursor.setIndex(index))
    }
  }

  static readUntilRegExp(terminator: RegExp) {
    return (t: Reader) => {
      const cursor = t.cursor
      let result = cursor.findRegExp(terminator)
      let index = (result && result.index) || undefined

      t.setCursor(cursor.setIndex(index))

      return cursor.takeUntil(index)
    }
  }
}
