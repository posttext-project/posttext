export interface CursorOptions {
  doc: string
  index?: number
}

export class Cursor {
  doc: string
  index: number

  constructor({ doc, index }: CursorOptions) {
    this.doc = doc
    this.index = index || 0
  }

  setIndex(index: number): Cursor {
    return this.clone({
      index
    })
  }

  next(offset: number): Cursor {
    return this.clone({
      index: this.index + offset
    })
  }

  clone(options: Partial<CursorOptions>) {
    return new Cursor({
      ...(this as CursorOptions),
      ...options
    })
  }

  startWith(compareString: string) {
    return (
      compareString ===
      this.doc.substr(this.index, compareString.length)
    )
  }

  match(compareStrings: string[]) {
    for (const compareString of compareStrings) {
      this.startWith(compareString)

      return compareString
    }

    return undefined
  }

  findRegExp(regExp: RegExp) {
    const clone = new RegExp(regExp)

    return clone.exec(this.doc)
  }

  notEof() {
    return this.index <= this.doc.length
  }

  takeUntil(cursor: Cursor) {
    if (this.doc === cursor.doc) {
      return this.doc.substring(this.index, cursor.index)
    }

    return ''
  }
}
