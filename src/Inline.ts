import { Brace } from './common/Brace'
import { PostText } from './PostText'
import { Matcher } from './reader/Matcher'
import { Reader, ReaderClosure } from './reader/Reader'
import { Structure } from './reader/Structure'
import { Word } from './Word'

export class Inline {
  static build(): ReaderClosure {
    return Structure.block([
      Structure.key('name', Inline.inlineName()),
      Structure.key('params', Inline.inlineParams()),
      Structure.key('options', Inline.inlineOptions()),
      Structure.key('content', Inline.inlineContent())
    ])
  }

  static inlineName(): ReaderClosure {
    return Structure.empty([
      Structure.nonKey(Matcher.ignoreLength(1)),
      Structure.overwrite(Word.build())
    ])
  }

  static inlineParams(): ReaderClosure {
    return (t: Reader) => ({})
  }

  static inlineOptions(): ReaderClosure {
    return (t: Reader) => ({})
  }

  static lookupContent(): ReaderClosure {
    return Structure.empty([
      Structure.nonKey(Matcher.ignoreUntil(/\S/)),
      Structure.overwrite(Matcher.startsWith('{'))
    ])
  }

  static inlineContent(): ReaderClosure {
    return Brace.ignoreBraces(() =>
      PostText.build({ isTopLevel: false })
    )
  }
}
