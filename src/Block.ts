import { Reader } from './Reader'
import { Pattern } from './Pattern'
import { Text } from './Text'
import { Word } from './Word'

export class Block {
  static build() {
    return (t: Reader) => {
      Pattern.skip(1)(t)

      const name = Block.blockName()(t)
    }
  }

  static blockName() {
    return Word.build()
  }

  static blockParams() {
    return (t: Reader) => ({})
  }

  static blockOptions() {
    return (t: Reader) => ({})
  }

  static blockContent() {
    return (t: Reader) => ({})
  }
}

export class BlockContent {
  static build() {
    return (t: Reader) => {
      Pattern.skipUntilRegExp(/\{|[^\s]/)

      
    }
  }
}
