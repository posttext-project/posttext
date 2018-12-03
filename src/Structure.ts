import { Reader, ReaderClosure } from './Reader'

export class Structure {
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

  static mutate(
    fn: ((value: any) => ReaderClosure)
  ): ReaderClosure {
    return (target: any) => (t: Reader) => {
      return fn(target)(t)
    }
  }

  static transform(
    transformer: Function,
    source: ReaderClosure
  ): ReaderClosure {
    return (t: Reader) => {
      return transformer(source(t))
    }
  }
}
