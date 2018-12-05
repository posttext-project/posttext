import { Matcher } from '../reader/Matcher'
import { Pattern } from '../reader/Pattern'
import { Reader, ReaderClosure } from '../reader/Reader'

export class Escape {
  static readUntil(
    terminators: string[],
    ignoreStrings: string[] = []
  ): ReaderClosure {
    return Pattern.repeatUntil(
      () => Matcher.oneOf(terminators),
      () => (t: Reader) => {
        const cursor = t.cursor

        let match
        if ((match = t.cursor.oneOf(ignoreStrings))) {
          t.setCursor(cursor.next(match.length))
        } else {
          t.setCursor(cursor.next(1))
        }
      }
    )
  }
}
