import { PluginMonad } from './PluginMonad'

export class Plugin {
  static create(options: any = {}): Plugin {
    return new (this as { new (options: any): Plugin })(options)
  }

  constructor(options: any) {}

  setup(t: PluginMonad): PluginMonad {
    return t
  }

  run(data: any) {
    return (t: PluginMonad) => {}
  }
}
