import { PluginConstructor } from './Plugin'
import { PluginInput } from './PluginInput'

export type PluginDescription =
  | PluginConstructor
  | [PluginConstructor, any?]

export interface PluginConfig {
  bootstrap: PluginDescription
  plugins?: PluginDescription[]
}

export class PluginRunner {
  private config: PluginConfig

  public static defaultConfig = {
    plugins: []
  }

  constructor(config: PluginConfig) {
    const ctor = this.constructor as typeof PluginRunner

    this.config = { ...ctor.defaultConfig, ...config }
  }

  public static normalizePluginDescription(
    pluginDescription: PluginDescription
  ): [PluginConstructor, any?] {
    return Array.isArray(pluginDescription)
      ? pluginDescription
      : [pluginDescription]
  }

  public static generatePluginMap(pluginConfig: PluginConfig) {
    const pluginMap = new Map()
    const plugins = [
      pluginConfig.bootstrap,
      ...pluginConfig.plugins
    ]

    for (const pluginDescription of plugins) {
      const [
        Plugin,
        pluginOptions
      ] = this.normalizePluginDescription(pluginDescription)

      const plugin = new Plugin()
      pluginMap.set(Plugin, [plugin, pluginOptions])
    }

    return pluginMap
  }

  public run(data?: any) {
    const ctor = this.constructor as typeof PluginRunner

    const [BootstrapPlugin] = ctor.normalizePluginDescription(
      this.config.bootstrap
    )

    const pluginMap = ctor.generatePluginMap(this.config)
    const parserInput = new PluginInput({
      pluginMap
    })

    parserInput.setup()

    return parserInput.run(BootstrapPlugin, data)
  }
}
