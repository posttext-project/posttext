import { PluginConstructor, PluginMap, Plugin } from './Plugin'
import { Middleware } from './Middleware'

export interface PluginInputOptions {
  data?: any
  options?: any
  pluginMap: PluginMap
}

export class PluginInput {
  public data: any
  public options: any

  private pluginMap: PluginMap

  constructor(options: PluginInputOptions) {
    this.data = options.data
    this.pluginMap = options.pluginMap
  }

  public setup() {
    const data = this.data

    for (const [_, [plugin, options]] of this.pluginMap) {
      const pluginInput = this.createNewInput({ data, options })

      plugin.setup(pluginInput)
    }
  }

  public getPlugin(
    Plugin: PluginConstructor
  ): Plugin | undefined {
    const [plugin] = this.pluginMap.get(Plugin) || [undefined]

    return plugin
  }

  public mock(
    Plugin: PluginConstructor,
    method: string,
    middleware: ((fn: Function) => Function)
  ) {
    const plugin = this.getPlugin(Plugin)

    return Middleware.mock(plugin, method, middleware)
  }

  public createNewInput(
    alterOptions: Partial<PluginInputOptions>
  ): PluginInput {
    return new PluginInput({
      ...(this as object),
      ...alterOptions
    } as PluginInputOptions)
  }

  public run(Plugin: PluginConstructor, data?: any) {
    const [plugin, options] = this.pluginMap.get(Plugin)
    const input = this.createNewInput({
      data,
      options
    })

    return plugin.run(input)
  }
}
