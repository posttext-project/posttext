import { Cursor } from './Cursor'
import { Reader } from './Reader'

export class Pattern extends Reader {
  static repeat(...fns: Function[]) {
    return (t: any) => {
      const pattern = t.getPlugin(Pattern)

      pattern.repeat(t)
    }
  }

  repeat(t: any, fns: Function[]) {}

  ignoreSpaces(t: any) {
    const cursor = t.getPlugin(Cursor)

    return t.setCursor(cursor.findRegexp(/[^\s]/))
  }
}
