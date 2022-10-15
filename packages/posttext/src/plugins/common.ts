/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Parser } from '../parser/parser.js'
import { Plugin } from '../plugin.js'
import { CommandResolver } from '../resolver.js'
import { CompilerPlugin } from './compiler.js'
import { HtmlPlugin } from './html.js'
import {
  RegistryPluginOptions,
  RegistryPlugin,
} from './registry'
import { StatePlugin } from './state.js'

export type CommonPluginOptions = RegistryPluginOptions & {
  parser: Parser
}

export class CommonPlugin implements Plugin {
  private compilerPlugin: CompilerPlugin
  private registryPlugin: RegistryPlugin
  private htmlPlugin: HtmlPlugin
  private statePlugin: StatePlugin

  constructor(options: CommonPluginOptions) {
    this.compilerPlugin = new CompilerPlugin(options)
    this.registryPlugin = new RegistryPlugin(options)
    this.htmlPlugin = new HtmlPlugin()
    this.statePlugin = new StatePlugin()
  }

  getCommandResolvers(): Record<string, CommandResolver> {
    return {
      ...this.compilerPlugin.getCommandResolvers(),
      ...this.registryPlugin.getCommandResolvers(),
      ...this.htmlPlugin.getCommandResolvers(),
      ...this.statePlugin.getCommandResolvers(),
    }
  }
}
