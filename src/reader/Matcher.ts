import { Reader, ReaderClosure } from './Reader'

export class Matcher {
  static startsWith(compareString: string): ReaderClosure {
    return (t: Reader) => {
      return t.cursor.startsWith(compareString)
    }
  }

  static match(regExp: RegExp): ReaderClosure {
    return (t: Reader) => {
      const cursor = t.cursor

      let result
      if ((result = cursor.findRegExp(regExp))) {
        if (result.index === cursor.index) {
          t.setCursor(cursor.next(result[0].length))

          return result[result.length - 1]
        }
      }

      return ''
    }
  }

  static matchAll(): ReaderClosure {
    return (t: Reader) => {
      const mark = t.cursor
      const cursor = mark.setIndex(mark.endIndex())

      return mark.takeUntil(cursor.index)
    }
  }

  static oneOf(compareStrings: string[]): ReaderClosure {
    return (t: Reader) => {
      return t.cursor.oneOf(compareStrings)
    }
  }

  static ignore(regExp: RegExp): ReaderClosure {
    return (t: Reader) => {
      const cursor = t.cursor

      let result
      if ((result = cursor.findRegExp(regExp))) {
        if (result.index === cursor.index) {
          t.setCursor(cursor.next(result[0].length))
        }
      }
    }
  }

  static ignoreUntil(regExp: RegExp): ReaderClosure {
    return (t: Reader) => {
      const cursor = t.cursor
      let result = cursor.findRegExp(regExp)
      let index = (result && result.index) || undefined

      t.setCursor(cursor.setIndex(index))
    }
  }

  static takeUntil(regExp: RegExp): ReaderClosure {
    return (t: Reader) => {
      const cursor = t.cursor

      let result
      if ((result = cursor.findRegExp(regExp))) {
        t.setCursor(cursor.setIndex(result.index))

        return cursor.takeUntil(result.index)
      }

      return cursor.takeUntil(cursor.endIndex())
    }
  }

  static matchLength(count: number): ReaderClosure {
    return (t: Reader) => {
      const mark = t.cursor
      const cursor = mark.next(count)

      t.setCursor(cursor)

      return mark.takeUntil(cursor.index)
    }
  }

  static ignoreLength(count: number): ReaderClosure {
    return (t: Reader) => {
      return t.cursor.next(count)
    }
  }
}
