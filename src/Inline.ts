import { Reader, ReaderClosure } from './common/Reader'
import { Structure } from './common/Structure'
import { Matcher } from './common/Matcher'
import { Word } from './Word'
import { PostText } from './PostText'

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
    return Structure.empty([
      Structure.nonKey(Inline.openBrace()),
      Structure.overwrite(PostText.build()),
      Structure.nonKey(Inline.closeBrace())
    ])
  }

  static openBrace(): ReaderClosure {
    return Structure.empty([
      Structure.nonKey(Matcher.ignoreUntil(/\S/)),
      Structure.nonKey(Matcher.ignoreLength(1))
    ])
  }

  static closeBrace(): ReaderClosure {
    return Matcher.ignoreLength(1)
  }
}
