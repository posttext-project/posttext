import { Reader } from './Reader'
import { Type } from './Type'
import { Pattern } from './Pattern'

export interface TextBuildOptions {
  isTopLevel?: boolean
}

export interface TextReadTextOptions {
  isTopLevel?: boolean
}

export class Text {
  static build({ isTopLevel }: TextBuildOptions) {
    return Pattern.reduce((text: string) => {
      return {
        type: Type.Text,
        text
      }
    }, Text.readText({ isTopLevel }))
  }

  static readText({ isTopLevel }: TextReadTextOptions) {
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
  ) {
    return (t: Reader) => {
      if (ignoreStrings.indexOf('') !== -1) {
        return ''
      }

      const mark = t.cursor
      let cursor = t.cursor

      while (cursor.notEof() && !cursor.oneOf(terminators)) {
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
