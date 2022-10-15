/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Command } from './command.js'
import { Module } from './module.js'

export type CommandResolver = (
  command: Command
) => AsyncGenerator<Command, any, any>

export type Resolver = () => AsyncGenerator<Command, any, any>

export interface TagResolver {
  data?: Record<string | number | symbol, Resolver>

  text?: Resolver

  inlines?: Resolver

  resolve: Resolver
}

export interface ModuleResolverStruct {
  modules: Record<string, Module>
}

export class ModuleResolver {
  private modules: Record<string, Module>
  private tagResolvers: Record<string, TagResolver>

  constructor({ modules }: ModuleResolverStruct) {
    this.modules = modules
  }

  importModule(moduleName: string): void {
    this.tagResolvers = {
      ...this.tagResolvers,
      ...this.modules[moduleName].getTagResolvers(),
    }
  }

  getTagResolver(identifier: string): TagResolver | undefined {
    const path = identifier.split(':')
    let mod: Module | undefined = undefined
    let mods: Record<string, Module> = this.modules
    for (const pathSeg of path.slice(0, -1)) {
      mod = mods[pathSeg]
      mods = mod.getSubmodules()
    }

    const tagResolvers =
      mod?.getTagResolvers() ?? this.tagResolvers
    const tagName = path[path.length - 1]

    return tagResolvers[tagName]
  }
}
