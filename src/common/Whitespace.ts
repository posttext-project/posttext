import { Matcher } from '../reader/Matcher'

export class Whitespace {
  static ignoreSpaces() {
    return Matcher.ignore(/\s+/)
  }
}
