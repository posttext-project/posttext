import { Cursor } from './Cursor'
import { Reader } from './Reader'
import { PluginMonad } from './PluginMonad'

export class Pattern extends Reader {
  static match(condition: boolean, cases: Function[]) {}

  static repeat(...fns: Function[]) {
    return (t: any) => {
      const pattern = t.getPlugin(Pattern)

      pattern.repeat(t)
    }
  }

  repeat() {}

  static ignoreSpaces() {
    return (t: PluginMonad) => {}
  }

  ignoreSpaces() {}
}
