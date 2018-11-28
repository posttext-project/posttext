import { Reader } from './Reader'
import { Pattern } from './Pattern'

export enum Type {
  Block = 'Block',
  Text = 'Text'
}

export class PostText {
  static transform(doc: string) {
    const reader = Reader.from({ doc })

    return PostText.build()(reader)
  }

  static build() {
    return Pattern.repeat(() =>
      Pattern.match(() => PostText.lookup(), [
        Pattern.of(Type.Block, () => Block.build()),
        Pattern.of(Type.Text, () => Text.build())
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
}

export class Block {
  static build() {
    return (t: Reader) => ({})
  }
}

export class Text {
  static build() {
    return (t: Reader) => {
      return {
        type: Type.Text,
        text: Pattern.readUntil('\\', ['\\\\'])(t)
      }
    }
  }
}
