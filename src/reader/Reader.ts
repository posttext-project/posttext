import { Cursor } from './cursor'

export interface ReaderOptions {
  cursor: Cursor
}

export interface ReaderLike {
  doc: string
}

export class Reader {
  cursor: Cursor

  static from({ doc }: ReaderLike) {
    return new Reader({ cursor: new Cursor({ doc }) })
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
