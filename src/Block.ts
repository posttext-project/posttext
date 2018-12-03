import { Reader, ReaderClosure } from './common/Reader'
import { Structure } from './common/Structure'
import { Matcher } from './common/Matcher'
import { Word } from './Word'

export class Block {
  static build(): ReaderClosure {
    return Structure.block([
      Structure.key('name', Block.blockName()),
      Structure.key('params', Block.blockParams()),
      Structure.key('options', Block.blockOptions()),
      Structure.key('content', Block.blockContent())
    ])
  }

  static blockName(): ReaderClosure {
    return Structure.empty([
      Structure.nonKey(Matcher.ignoreUntil(/[^=]/)),
      Structure.nonKey(Matcher.ignoreUntil(/\S/)),
      Structure.overwrite(Word.build())
    ])
  }

  static blockParams(): ReaderClosure {
    return (t: Reader) => ({})
  }

  static blockOptions(): ReaderClosure {
    return (t: Reader) => ({})
  }

  static blockContent(): ReaderClosure {
    return (t: Reader) => ({})
  }
}
