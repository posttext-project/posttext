import { Reader, ReaderClosure } from './common/Reader'
import { Pattern } from './common/Pattern'
import { Matcher } from './common/Matcher'
import { Text } from './Text'
import { Block } from './Block'
import { Type } from './Type'

export interface PostTextBuildOptions {
  isTopLevel?: boolean
}

export class PostText {
  static transform(doc: string) {
    const reader = Reader.from({ doc })

    return PostText.build({ isTopLevel: true })(reader)
  }

  static build({
    isTopLevel
  }: PostTextBuildOptions = {}): ReaderClosure {
    return Pattern.split(/^=+/m, () =>
      Pattern.repeatUntil(
        () =>
          PostText.isEnd({
            isTopLevel
          }),
        () =>
          Pattern.match(() => PostText.lookup(), [
            Pattern.of(Type.Block, () => Block.build()),
            Pattern.of(Type.Text, () =>
              Text.build({ isTopLevel })
            )
          ])
      )
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
  }: PostTextBuildOptions): ReaderClosure {
    return !isTopLevel
      ? Matcher.startsWith('}')
      : Pattern.isFalse()
  }
}
