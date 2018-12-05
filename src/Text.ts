import { Escape } from './common/Escape'
import { ReaderClosure } from './reader/Reader'
import { Structure } from './reader/Structure'
import { Type } from './Type'

export interface TextBuildOptions {
  isTopLevel?: boolean
}

export class Text {
  static build({
    isTopLevel
  }: TextBuildOptions = {}): ReaderClosure {
    return Structure.transform((text: string) => {
      return {
        type: Type.Text,
        text
      }
    }, Text.readText({ isTopLevel }))
  }

  static readText({
    isTopLevel
  }: TextBuildOptions): ReaderClosure {
    return isTopLevel
      ? Escape.readUntil(['\\'], ['\\\\', '\\{', '\\}'])
      : Escape.readUntil(['\\', '}'], ['\\\\', '\\{', '\\}'])
  }
}
