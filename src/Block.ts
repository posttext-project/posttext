import { ASTNode } from './ASTNode'
import { Brace } from './common/Brace'
import { Escape } from './common/Escape'
import { Whitespace } from './common/Whitespace'
import { PostText } from './PostText'
import { Matcher } from './reader/Matcher'
import { Pattern } from './reader/Pattern'
import { ReaderClosure } from './reader/Reader'
import { Structure } from './reader/Structure'
import { Type } from './Type'
import { Word } from './Word'

export interface BlockBuildOptions {
  raw?: boolean
}

export class Block {
  static build(): ReaderClosure {
    return Structure.block([
      Structure.key('level', Block.blockLevel()),
      Structure.key('name', Block.blockName()),
      Structure.key('params', Block.blockParams()),
      Structure.key('options', Block.blockOptions()),
      Structure.mutate((node: ASTNode) =>
        Structure.key(
          'content',
          Block.blockContent({
            raw:
              ['language', 'verbatim', 'raw'].indexOf(
                node.name
              ) !== -1
          })
        )
      )
    ])
  }

  static blockLevel(): ReaderClosure {
    return Structure.transform(
      (sequence: string) => sequence.length,
      Matcher.match(/=+/)
    )
  }

  static blockName(): ReaderClosure {
    return Structure.empty([
      Structure.nonKey(Whitespace.ignoreSpaces()),
      Structure.overwrite(Word.build())
    ])
  }

  static lookupParams(): ReaderClosure {
    return Matcher.match(/[ \t]*\(/)
  }

  static blockParams(): ReaderClosure {
    return Pattern.match(() => Block.lookupParams(), [
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
    return Matcher.match(/[ \t]*\[/)
  }

  static blockOptions(): ReaderClosure {
    return Pattern.match(() => Block.lookupOptions(), [
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

  static blockContent({
    raw
  }: BlockBuildOptions = {}): ReaderClosure {
    return raw
      ? Structure.sequence([
          Structure.push(
            Structure.transform(
              (text: string) => ({
                type: Type.Text,
                text
              }),
              Matcher.matchAll()
            )
          )
        ])
      : PostText.build()
  }
}
