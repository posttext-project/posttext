import { Reader } from './Reader'
import { Pattern } from './Pattern'
import { Text } from './Text'
import { Block } from './Block'
import { Type } from './Type'

export interface PostTextBuildOptions {
  isTopLevel?: boolean
}

export interface PostTextIsEndOptions {
  isTopLevel?: boolean
}

export class PostText {
  static transform(doc: string) {
    const reader = Reader.from({ doc })

    return PostText.build({ isTopLevel: true })(reader)
  }

  static build({ isTopLevel }: PostTextBuildOptions = {}) {
    return Pattern.repeatUntil(
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
  }

  static lookup() {
    return (t: Reader) => {
      if (
        t.cursor.startWith('\\') &&
        !t.cursor.startWith('\\\\')
      ) {
        return Type.Block
      }

      return Type.Text
    }
  }

  static isEnd({ isTopLevel }: PostTextIsEndOptions) {
    return (t: Reader) => {
      if (!isTopLevel) {
        return t.cursor.startWith('}')
      }

      return false
    }
  }
}
