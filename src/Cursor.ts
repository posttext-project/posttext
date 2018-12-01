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

  clone(options: Partial<CursorOptions>) {
    return new Cursor({
      ...(this as CursorOptions),
      ...options
    })
  }

  setIndex(index?: number): Cursor {
    if (!index) {
      return this.clone({
        index: this.doc.length
      })
    }

    if (index <= this.index) {
      return this
    }

    if (
      (this.end && this.index < this.end) ||
      index > this.doc.length
    ) {
      return this.clone({
        index: this.end
      })
    }

    return this.clone({
      index
    })
  }

  next(offset: number): Cursor {
    return this.setIndex(this.index + offset)
  }

  lookup(len?: number): string {
    return this.doc.substring(
      this.index,
      len && this.index + len
    )
  }

  startWith(compareString: string): boolean {
    return compareString === this.lookup(compareString.length)
  }

  oneOf(compareStrings: string[]): string | undefined {
    for (const compareString of compareStrings) {
      if (this.startWith(compareString)) {
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
    clone.lastIndex = this.index

    return clone.exec(this.doc)
  }

  eof(): boolean {
    return this.end
      ? this.index >= this.end
      : this.index >= this.doc.length
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

  takeUntil(index?: number): string {
    return this.doc.substring(this.index, index)
  }
}
