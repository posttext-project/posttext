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

      while (t.cursor.notEof() && !condition()(t)) {
        output.push(fn()(t))
      }

      return output
    }
  }

  static match(condition: Function, cases: Function[]) {
    return (t: Reader) => {
      const value = condition()(t.clone())

      return Pattern._match(value, cases)(t)
    }
  }

  static isTrue() {
    return (t: Reader) => true
  }

  static _match(value: any, cases: Function[]) {
    return (t: Reader) => {
      if (cases) {
        const [first, ...rest] = cases

        return first(value, () =>
          Pattern._match(value, rest)(t)
        )(t)
      }
    }
  }

  static of(matchValue: any, callback: Function) {
    return (value: any, next: Function) => (t: Reader) => {
      if (value === matchValue) {
        return callback()(t)
      }

      return next()
    }
  }

  static block(fns: Function[]) {
    return (t: Reader) => {
      let target = {}

      for (const fn of fns) {
        target = fn(target)(t)
      }

      return target
    }
  }

  static key(name: string, fn: Function) {
    return (target: object) => (t: Reader) => {
      return {
        ...target,
        [name]: fn(t)
      }
    }
  }

  static nonKey(fn: Function) {
    return (target: any) => (t: Reader) => {
      fn(t)

      return target
    }
  }

  static sequence(fns: Function[]) {
    return (t: Reader) => {
      let target: any[] = []

      for (const fn of fns) {
        target = fn(target)(t)
      }

      return target
    }
  }

  static push(fn: Function) {
    return (target: any[]) => (t: Reader) => {
      return [...target, fn(t)]
    }
  }

  static reduce(reducer: Function, source: Function) {
    return (t: Reader) => {
      return reducer(source(t))
    }
  }

  static empty(fns: Function[]) {
    return (t: Reader) => {
      let target = undefined

      for (const fn of fns) {
        target = fn(target)(t)
      }

      return target
    }
  }

  static overwrite(fn: Function) {
    return (target: any) => (t: Reader) => {
      return fn(t)
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
