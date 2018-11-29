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
    this.end = end
      ? end < doc.length
        ? end
        : undefined
      : undefined
  }

  setIndex(index?: number): Cursor {
    if (!index) {
      return this.clone({
        index: this.doc.length
      })
    }

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

  oneOf(compareStrings: string[]) {
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

  endAt(index: number): Cursor {
    if (index <= this.doc.length) {
      if (index < 0) {
        return this.clone({
          end: 0
        })
      }

      return this.clone({
        end: index
      })
    }

    return this.clone({
      end: this.doc.length
    })
  }

  takeUntil(index?: number) {
    return this.doc.substring(this.index, index)
  }
}
