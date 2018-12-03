import { Reader, ReaderClosure } from './common/Reader'
import { Structure } from './common/Structure'
import { Type } from './Type'

export interface TextBuildOptions {
  isTopLevel?: boolean
}

export class Text {
  static build({
    isTopLevel
  }: TextBuildOptions): ReaderClosure {
    return Structure.transform((text: string) => {
      return {
        type: Type.Text,
        text
      }
    }, Text.readText({ isTopLevel }))
  }

  static readText({
    isTopLevel
  }: TextBuildOptions): ReaderClosure {
    if (isTopLevel) {
      return Text.readUntilAndIgnore(
        ['\\'],
        ['\\\\', '\\{', '\\}']
      )
    } else {
      return Text.readUntilAndIgnore(
        ['\\', '}'],
        ['\\\\', '\\{', '\\}']
      )
    }
  }

  static readUntilAndIgnore(
    terminators: string[],
    ignoreStrings: string[] = []
  ): ReaderClosure {
    return (t: Reader) => {
      if (ignoreStrings.indexOf('') !== -1) {
        return ''
      }

      const mark = t.cursor
      let cursor = t.cursor

      while (!cursor.eof() && !cursor.oneOf(terminators)) {
        const matchString = cursor.oneOf(ignoreStrings)

        if (!matchString) {
          cursor = cursor.next(1)
        } else {
          cursor = cursor.next(matchString.length)
        }
      }

      t.setCursor(cursor)

      return mark.takeUntil(cursor.index)
    }
  }
}
