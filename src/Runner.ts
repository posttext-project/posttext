import { Plugin } from './Plugin'
import { PluginMonad } from './PluginMonad'

export interface RunnerOptions {
  core: Plugin
  plugins?: ((t: PluginMonad) => PluginMonad)[]
}

export class Runner {
  private core: Plugin
  private plugins: ((t: PluginMonad) => PluginMonad)[]

  constructor(options: RunnerOptions) {
    this.core = options.core
    this.plugins = options.plugins || []
  }

  run(data: any) {
    const pluginMonad = new PluginMonad({})

    return this.core.run(
      data
    )(pluginMonad)
  }
}
