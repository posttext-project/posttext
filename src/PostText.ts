import { Reader, ReaderClosure } from './reader/Reader'
import { Pattern } from './reader/Pattern'
import { Matcher } from './reader/Matcher'
import { Text } from './Text'
import { Block } from './Block'
import { Type } from './Type'
import { Inline } from './Inline'

export interface PostTextBuildOptions {
  isTopLevel?: boolean
}

export class PostText {
  static transform(doc: string) {
    const reader = Reader.from({ doc })

    return PostText.buildTopLevel()(reader)
  }

  static buildTopLevel() {
    return Pattern.split(/^=+/m, () =>
      Pattern.match(() => Matcher.startsWith('='), [
        Pattern.of(true, () => Block.build()),
        Pattern.of(false, () => PostText.build())
      ])
    )
  }

  static build({
    isTopLevel = true
  }: PostTextBuildOptions = {}): ReaderClosure {
    return Pattern.repeatUntil(
      () => PostText.isEnd({ isTopLevel }),
      () =>
        Pattern.match(() => PostText.lookup(), [
          Pattern.of(Type.Text, () =>
            Text.build({ isTopLevel })
          ),
          Pattern.of(Type.Inline, () => Inline.build())
        ])
    )
  }

  static lookup(): ReaderClosure {
    return (t: Reader) => {
      if (
        t.cursor.startsWith('\\') &&
        !t.cursor.startsWith('\\\\')
      ) {
        return Type.Block
      }

      return Type.Text
    }
  }

  static isEnd({
    isTopLevel
  }: PostTextBuildOptions = {}): ReaderClosure {
    return !isTopLevel
      ? Matcher.startsWith('}')
      : Pattern.isFalse()
  }
}
