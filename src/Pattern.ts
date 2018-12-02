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

  static repeatUntil(
    condition: Function,
    fn: ReaderClosureStatement
  ): ReaderClosure {
    return (t: Reader) => {
      const output = []

      let lastIndex
      while (
        !t.cursor.eof() &&
        !(lastIndex && t.cursor.index === lastIndex) &&
        !condition()(t)
      ) {
        lastIndex = t.cursor.index

        output.push(fn()(t))
      }

      return output
    }
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

  static isTrue(): ReaderClosure {
    return (t: Reader) => true
  }

  static isFalse(): ReaderClosure {
    return (t: Reader) => false
  }

  static _match(
    value: any,
    cases: ((value: any, next: Function) => ReaderClosure)[]
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
    callback: ReaderClosureStatement
  ): ((value: any, next: Function) => ReaderClosure) {
    return (value: any, next: Function) => (t: Reader) => {
      if (value === matchValue) {
        return callback()(t)
      }

      return next()
    }
  }

  static block(
    fns: ((target: any) => ReaderClosure)[]
  ): ReaderClosure {
    return (t: Reader) => {
      let target = {}

      for (const fn of fns) {
        target = fn(target)(t)
      }

      return target
    }
  }

  static key(
    name: string,
    fn: ReaderClosure
  ): ((target: object) => ReaderClosure) {
    return (target: object) => (t: Reader) => {
      return {
        ...target,
        [name]: fn(t)
      }
    }
  }

  static nonKey(
    fn: ReaderClosure
  ): ((target: any) => ReaderClosure) {
    return (target: any) => (t: Reader) => {
      fn(t)

      return target
    }
  }

  static sequence(
    fns: ((target: any) => ReaderClosure)[]
  ): ReaderClosure {
    return (t: Reader) => {
      let target: any[] = []

      for (const fn of fns) {
        target = fn(target)(t)
      }

      return target
    }
  }

  static push(
    fn: ReaderClosure
  ): ((target: any[]) => ReaderClosure) {
    return (target: any[]) => (t: Reader) => {
      return [...target, fn(t)]
    }
  }

  static reduce(
    reducer: Function,
    source: ReaderClosure
  ): ReaderClosure {
    return (t: Reader) => {
      return reducer(source(t))
    }
  }

  static constant(value: any): ReaderClosure {
    return (t: Reader) => {
      return value
    }
  }

  static empty(
    fns: ((target: any) => ReaderClosure)[]
  ): ReaderClosure {
    return (t: Reader) => {
      let target = undefined

      for (const fn of fns) {
        target = fn(target)(t)
      }

      return target
    }
  }

  static overwrite(fn: ReaderClosure): ReaderClosure {
    return (target: any) => (t: Reader) => {
      return fn(t)
    }
  }

  static startWith(compareString: string): ReaderClosure {
    return (t: Reader) => {
      return t.cursor.startWith(compareString)
    }
  }

  static skip(count: number): ReaderClosure {
    return (t: Reader) => {
      t.setCursor(t.cursor.next(count))
    }
  }

  static skipUntilRegExp(terminator: RegExp): ReaderClosure {
    return (t: Reader) => {
      const cursor = t.cursor
      let result = cursor.findRegExp(terminator)
      let index = (result && result.index) || undefined

      t.setCursor(cursor.setIndex(index))
    }
  }

  static readUntilRegExp(terminator: RegExp): ReaderClosure {
    return (t: Reader) => {
      const cursor = t.cursor
      let result = cursor.findRegExp(terminator)
      let index = (result && result.index) || undefined

      t.setCursor(cursor.setIndex(index))

      return cursor.takeUntil(index)
    }
  }

  static split(
    regExp: RegExp,
    fn: ReaderClosureStatement
  ): ReaderClosure {
    return (t: Reader) => {
      return t.cursor.split(regExp).map(cursor => {
        const reader = t.setCursor(cursor)

        return fn()(t)
      })
    }
  }
}
