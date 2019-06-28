export interface ImmutableCursorOptions {
  doc: string
  index?: number
  end?: number
}

export class ImmutableCursor {
  doc: string
  index: number
  end?: number

  constructor({ doc, index, end }: ImmutableCursorOptions) {
    this.doc = doc
    this.index = index || 0
    this.end = end
      ? end < doc.length
        ? end
        : undefined
      : undefined
  }

  clone(options: Partial<ImmutableCursorOptions>) {
    return new ImmutableCursor({
      ...(this as ImmutableCursorOptions),
      ...options
    })
  }

  endIndex() {
    return this.end || this.doc.length
  }

  setIndex(index?: number): ImmutableCursor {
    if (!index) {
      return this.clone({
        index: this.doc.length
      })
    }

    if (index <= this.index) {
      return this
    }

    if (index > this.endIndex()) {
      return this.clone({
        index: this.endIndex()
      })
    }

    return this.clone({
      index
    })
  }

  next(offset: number): ImmutableCursor {
    return this.setIndex(this.index + offset)
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
    clone.lastIndex = this.index

    return clone.exec(this.doc)
  }

  eof(): boolean {
    return this.index >= this.endIndex()
  }

  endAt(index: number): ImmutableCursor {
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

  takeUntil(index: number): string {
    return this.doc.substring(this.index, index)
  }
}
