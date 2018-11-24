import { ConstructorType } from './ConstructorType'
import { PluginInput } from './PluginInput'

export class Plugin {
  constructor() {}

  setup(t: PluginInput) {}

  run(t: PluginInput) {}
}

export type PluginConstructor = ConstructorType<Plugin>
export type PluginMap = Map<PluginConstructor, [Plugin, any]>
