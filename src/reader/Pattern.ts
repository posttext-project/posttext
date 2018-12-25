import {
  Reader,
  ReaderClosure,
  ReaderClosureStatement
} from './Reader'

export class Pattern {
  static repeat(fn: ReaderClosureStatement): ReaderClosure {
    return Pattern.repeatUntil(
      () => Pattern.isTrue(),
      () => fn()
    )
  }

  static repeatWhile(
    condition: ReaderClosureStatement,
    fn: ReaderClosureStatement
  ): ReaderClosure {
    return (t: Reader) => {
      const output = []

      let lastIndex
      while (
        !t.cursor.eof() &&
        !(lastIndex && t.cursor.index === lastIndex) &&
        condition()(t)
      ) {
        lastIndex = t.cursor.index

        output.push(fn()(t))
      }

      return output
    }
  }

  static repeatUntil(
    condition: ReaderClosureStatement,
    fn: ReaderClosureStatement
  ): ReaderClosure {
    return Pattern.repeatWhile(
      () => (t: Reader) => !condition()(t),
      fn
    )
  }

  static takeWhile(
    condition: ReaderClosureStatement,
    fn: ReaderClosureStatement
  ): ReaderClosure {
    return (t: Reader) => {
      const mark = t.cursor

      let lastIndex
      while (
        !t.cursor.eof() &&
        !(lastIndex && t.cursor.index === lastIndex) &&
        condition()(t)
      ) {
        fn()(t)
      }

      return mark.takeUntil(t.cursor.index)
    }
  }

  static takeUntil(
    condition: ReaderClosureStatement,
    fn: ReaderClosureStatement
  ): ReaderClosure {
    return Pattern.takeWhile(
      () => (t: Reader) => !condition()(t),
      fn
    )
  }

  static match(
    condition: ReaderClosureStatement,
    cases: ((value: any, next: Function) => ReaderClosure)[]
  ): ReaderClosure {
    return (t: Reader) => {
      const value = condition()(t.clone())

      return Pattern._match(value, cases)(t)
    }
  }

  static _match(
    value: any,
    cases: ((
      value: any,
      next: ReaderClosureStatement
    ) => ReaderClosure)[]
  ): ReaderClosure {
    return (t: Reader) => {
      if (cases) {
        const [first, ...rest] = cases

        return first(value, () =>
          Pattern._match(value, rest)(t)
        )(t)
      }
    }
  }

  static of(
    matchValue: any,
    fn: ReaderClosureStatement
  ): ((value: any, next: Function) => ReaderClosure) {
    return (value: any, next: Function) => (t: Reader) => {
      if (value === matchValue) {
        return fn()(t)
      }

      return next()
    }
  }

  static then(fn: ReaderClosureStatement) {
    return (value: any, next: Function) => (t: Reader) => {
      if (value) {
        return fn()(t)
      }

      return next()
    }
  }

  static otherwise(fn: ReaderClosureStatement) {
    return (value: any, next: Function) => (t: Reader) => {
      return fn()(t)
    }
  }

  static split(
    regExp: RegExp,
    fn: ReaderClosureStatement
  ): ReaderClosure {
    return (t: Reader) => {
      return t.cursor.split(regExp).map(cursor => {
        t.setCursor(cursor)

        return fn()(t)
      })
    }
  }

  static constant(value: any): ReaderClosure {
    return (t: Reader) => value
  }

  static isTrue(): ReaderClosure {
    return (t: Reader) => true
  }

  static isFalse(): ReaderClosure {
    return (t: Reader) => false
  }
}
