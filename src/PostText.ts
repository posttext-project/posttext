import { PluginConstructor, PluginMap, Plugin } from './Plugin'
import { PluginInput } from './PluginInput'
import { PluginConfig, PluginRunner } from './PluginRunner'

export class PostText extends Plugin {
  run(t: PluginInput) {
    console.log(t.data)
  }
}
