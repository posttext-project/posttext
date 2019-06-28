import { Cursor } from './Cursor'

export interface ReaderOptions {
  cursor: Cursor
}

export interface ReaderLike {
  doc: string
}

export type ReaderClosure = (t: Reader) => any

export type ReaderClosureStatement = () => ReaderClosure

export class Reader {
  cursor: Cursor

  static from({ doc }: ReaderLike) {
    return new Reader({ cursor: new Cursor({ doc }) })
  }

  static run(
    fn: ReaderClosure
  ): ((
    doc: string | TemplateStringsArray,
    ...rest: string[]
  ) => any) {
    return (
      doc: string | TemplateStringsArray,
      ...rest: string[]
    ) => {
      if (typeof doc === 'string') {
        const t = Reader.from({ doc })

        return fn(t)
      }

      return Reader.run(fn)(String.raw(doc, ...rest))
    }
  }

  constructor({ cursor }: ReaderOptions) {
    this.cursor = cursor
  }

  setCursor(cursor: Cursor) {
    this.cursor = cursor
  }

  clone(options: Partial<ReaderOptions> = {}): Reader {
    return new Reader({
      ...(this as ReaderOptions),
      ...options
    })
  }
}
