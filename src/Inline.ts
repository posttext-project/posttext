import { Brace } from './common/Brace'
import { Escape } from './common/Escape'
import { Matcher } from './reader/Matcher'
import { Pattern } from './reader/Pattern'
import { ReaderClosure } from './reader/Reader'
import { Structure } from './reader/Structure'
import { Whitespace } from './common/Whitespace'

export class Inline {
  static build(): ReaderClosure {
    return Structure.block([
      Structure.nonKey(Inline.ignoreBackSlash()),
      Structure.key('name', Inline.inlineName()),
      Structure.key('params', Inline.inlineParams()),
      Structure.key('options', Inline.inlineOptions()),
      Structure.key('content', Inline.inlineContent())
    ])
  }

  static ignoreBackSlash() {
    return Matcher.match(/\\/)
  }

  static inlineName(): ReaderClosure {
    return Structure.transform(
      (sequence: string) => sequence.length,
      Matcher.match(/\\/)
    )
  }

  static lookupParams() {
    return Matcher.match(/[ \t]*\(/)
  }

  static inlineParams(): ReaderClosure {
    return Pattern.match(() => Inline.lookupParams(), [
      Pattern.then(() =>
        Structure.empty([
          Structure.nonKey(Whitespace.ignoreSpaces()),
          Structure.overwrite(
            Brace.ignoreParens(() =>
              Pattern.repeatUntil(
                () => Matcher.startsWith(')'),
                () =>
                  Escape.readUntil(
                    [',', ')'],
                    ['\\)', '\\,', '']
                  )
              )
            )
          )
        ])
      ),
      Pattern.otherwise(() => Pattern.constant([]))
    ])
  }

  static lookupOptions() {
    return Matcher.match(/[\s]*\[/)
  }

  static inlineOptions(): ReaderClosure {
    return Pattern.match(() => Inline.lookupOptions(), [
      Pattern.then(() =>
        Structure.empty([
          Structure.nonKey(Whitespace.ignoreSpaces()),
          Structure.overwrite(
            Brace.ignoreBrackets(() =>
              Pattern.repeatUntil(
                () => Matcher.startsWith(']'),
                () =>
                  Escape.readUntil(
                    [',', ']'],
                    ['\\]', '\\,', '\\;']
                  )
              )
            )
          )
        ])
      ),
      Pattern.otherwise(() => Pattern.constant([]))
    ])
  }

  static lookupContent(): ReaderClosure {
    return Matcher.match(/[\s]*\{/)
  }

  static inlineContent(): ReaderClosure {
    return Pattern.match(() => Inline.lookupContent(), [
      Brace.ignoreBraces(() =>
        Pattern.repeatUntil(
          () => Matcher.startsWith('}'),
          () => Escape.readUntil(['}'], ['\\', '\\{', '\\}'])
        )
      )
    ])
  }
}
