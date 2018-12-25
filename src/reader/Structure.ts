import { Reader, ReaderClosure } from './Reader'

export class Structure {
  static structure(
    container: any,
    fns: ((target: any) => ReaderClosure)[]
  ): ReaderClosure {
    return (t: Reader) => {
      let target = container

      for (const fn of fns) {
        target = fn(target)(t)
      }

      return target
    }
  }

  static block(
    fns: ((target: any) => ReaderClosure)[]
  ): ReaderClosure {
    return Structure.structure({}, fns)
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
    return Structure.structure([], fns)
  }

  static push(
    fn: ReaderClosure
  ): ((target: any[]) => ReaderClosure) {
    return (target: any[]) => (t: Reader) => {
      return [...target, fn(t)]
    }
  }

  static unshift(
    fn: ReaderClosure
  ): ((target: any[]) => ReaderClosure) {
    return (target: any[]) => (t: Reader) => {
      return [fn(t), ...target]
    }
  }

  static empty(
    fns: ((target: any) => ReaderClosure)[]
  ): ReaderClosure {
    return Structure.structure(undefined, fns)
  }

  static overwrite(fn: ReaderClosure): ReaderClosure {
    return (target: any) => (t: Reader) => {
      return fn(t)
    }
  }

  static mutate(
    fn: ((value: any) => (target: any) => ReaderClosure)
  ) {
    return (target: any) => fn(target)(target)
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
