/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Module } from './module'
import { Registry } from './registry'
import { TagResolver } from './resolver'

export interface ScopeStruct {
  tagResolvers?: Record<string, TagResolver>
  modules?: Record<string, Module>
  registry: Registry
}

export class Scope {
  private tagResolvers: Record<string, TagResolver>
  private modules: Record<string, Module>
  private registry: Registry

  constructor({
    tagResolvers,
    modules,
    registry,
  }: ScopeStruct) {
    this.tagResolvers = tagResolvers ?? {}
    this.modules = modules ?? {}
    this.registry = registry
  }

  clone(): Scope {
    return new Scope({
      tagResolvers: this.tagResolvers,
      modules: this.modules,
      registry: this.registry,
    })
  }

  getTagResolver(identifier: string): TagResolver | undefined {
    return this.tagResolvers[identifier]
  }

  private getModule(moduleName: string): Module | undefined {
    return (
      this.registry.getModule(moduleName) ??
      this.modules[moduleName]
    )
  }

  hasModule(moduleName: string): boolean {
    return this.getModule(moduleName) ? true : false
  }

  importModule(moduleName: string): void {
    this.tagResolvers = {
      ...this.tagResolvers,
      ...(this.modules[moduleName]?.getTagResolvers() ?? {}),
    }
  }

  usedModule(moduleName: string): boolean {
    return this.modules[moduleName] ? true : false
  }

  useModule(moduleName: string): void {
    const mod = this.getModule(moduleName)
    if (mod) {
      this.modules = {
        ...this.modules,
        [moduleName]: mod,
      }
    }
  }
}
