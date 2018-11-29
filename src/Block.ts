import { Reader } from './Reader'
import { Pattern } from './Pattern'
import { Word } from './Word'
import { PostText } from './PostText'

export class Block {
  static build() {
    return Pattern.block([
      Pattern.key('name', Block.blockName()),
      Pattern.key('content', Block.blockContent())
    ])
  }

  static blockName() {
    return Pattern.empty([
      Pattern.nonKey(Pattern.skip(1)),
      Pattern.overwrite(Word.build())
    ])
  }

  static blockParams() {
    return (t: Reader) => ({})
  }

  static blockOptions() {
    return (t: Reader) => ({})
  }

  static blockContent() {
    return Pattern.empty([
      Pattern.nonKey(Block.openBrace()),
      Pattern.overwrite(PostText.build()),
      Pattern.nonKey(Block.closeBrace())
    ])
  }

  static openBrace() {
    return Pattern.empty([
      Pattern.nonKey(Pattern.skipUntilRegExp(/[^\s]/)),
      Pattern.nonKey(Pattern.skip(1))
    ])
  }

  static closeBrace() {
    return Pattern.skip(1)
  }
}
