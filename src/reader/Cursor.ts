export interface CursorOptions {
  doc: string
  index?: number
  end?: number
}

export class Cursor {
  doc: string
  index: number
  end?: number

  constructor({ doc, index, end }: CursorOptions) {
    this.doc = doc
    this.index = index || 0
    this.end = end ? end < doc.length ? end : undefined : undefined
  }

  from(doc: string): Cursor {
    return new Cursor({ doc })
  }

  clone(options?: Partial<CursorOptions>) {
    return new Cursor({
      ...(this as CursorOptions),
      ...(options ? options : {})
    })
  }

  endIndex() {
    return this.end || this.doc.length
  }

  setIndex(index?: number) {
    if (index !== 0 && !index) {
      this.index = this.doc.length
      return
    }

    if (index < 0) {
      this.index = 0
      return
    }

    if (index > this.endIndex()) {
      this.index = this.endIndex()
      return
    }

    this.index = index
  }

  next(offset: number) {
    this.setIndex(this.index + offset)
  }

  lookup(len?: number): string {
    return this.doc.substring(
      this.index,
      len && this.index + len
    )
  }

  startsWith(compareString: string): boolean {
    return compareString === this.lookup(compareString.length)
  }

  oneOf(compareStrings: string[]): string | undefined {
    for (const compareString of compareStrings) {
      if (this.startsWith(compareString)) {
        return compareString
      }
    }

    return undefined
  }

  findRegExp(regExp: RegExp): RegExpExecArray | null {
    const flags = regExp.flags
    const clone = new RegExp(
      regExp,
      flags.indexOf('g') === -1 ? flags + 'g' : flags
    )

    return clone.exec(this.doc)
  }

  eof(): boolean {
    return this.index >= this.endIndex()
  }

  endAt(index: number): Cursor {
    if (index <= this.endIndex()) {
      if (index < 0) {
        return this.clone({
          end: 0
        })
      }

      return this.clone({
        end: index
      })
    }

    return this.clone()
  }

  takeUntil(cursorOrIndex: Cursor | number): string {
    if (typeof cursorOrIndex === 'number') {
      return this.doc.substring(this.index, cursorOrIndex)
    }
    
    return this.doc.substring(this.index, cursorOrIndex.index)
  }
}
