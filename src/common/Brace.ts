import { Matcher } from '../reader/Matcher'
import { Pattern } from '../reader/Pattern'
import { ReaderClosureStatement } from '../reader/Reader'
import { Structure } from '../reader/Structure'

export class Brace {
  static ignoreBraces(fn: ReaderClosureStatement) {
    return Pattern.match(() => Matcher.startsWith('{'), [
      Pattern.of(true, () =>
        Structure.empty([
          Structure.nonKey(Matcher.ignoreLength(1)),
          Structure.overwrite(fn()),
          Structure.nonKey(Matcher.ignore(/\}/))
        ])
      )
    ])
  }

  static ignoreBrackets(fn: ReaderClosureStatement) {
    return Pattern.match(() => Matcher.startsWith('['), [
      Pattern.of(true, () =>
        Structure.empty([
          Structure.nonKey(Matcher.ignoreLength(1)),
          Structure.overwrite(fn()),
          Structure.nonKey(Matcher.ignore(/\]/))
        ])
      )
    ])
  }

  static ignoreParens(fn: ReaderClosureStatement) {
    return Pattern.match(() => Matcher.startsWith('('), [
      Pattern.of(true, () =>
        Structure.empty([
          Structure.nonKey(Matcher.ignoreLength(1)),
          Structure.overwrite(fn()),
          Structure.nonKey(Matcher.ignore(/\)/))
        ])
      )
    ])
  }
}
