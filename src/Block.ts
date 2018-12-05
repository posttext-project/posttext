import { ASTNode } from './ASTNode'
import { Brace } from './common/Brace'
import { Escape } from './common/Escape'
import { PostText } from './PostText'
import { Matcher } from './reader/Matcher'
import { Pattern } from './reader/Pattern'
import { ReaderClosure } from './reader/Reader'
import { Structure } from './reader/Structure'
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
    return Structure.empty([Structure.overwrite(Word.build())])
  }

  static lookupParams(): ReaderClosure {
    return Matcher.match(/[\ \t]*\(/)
  }

  static blockParams(): ReaderClosure {
    return Pattern.repeatWhile(
      () => Block.lookupParams(),
      () =>
        Brace.ignoreParens(() =>
          Pattern.repeatUntil(
            () => Matcher.startsWith(')'),
            () =>
              Escape.readUntil([',', ')'], ['\\)', '\\,', ''])
          )
        )
    )
  }

  static lookupOptions() {
    return Matcher.match(/[\ \t]*\[/)
  }

  static blockOptions(): ReaderClosure {
    return Pattern.repeatWhile(
      () => Block.lookupOptions(),
      () =>
        Brace.ignoreBrackets(() =>
          Pattern.repeatUntil(
            () => Matcher.startsWith(']'),
            () =>
              Escape.readUntil([',', ']'], ['\\]', '\\,', ''])
          )
        )
    )
  }

  static blockContent({
    raw
  }: BlockBuildOptions = {}): ReaderClosure {
    return raw ? Matcher.matchAll() : PostText.build()
  }
}
