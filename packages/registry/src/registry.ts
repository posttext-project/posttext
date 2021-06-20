/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Module } from './module.js'
import { Resolver } from './resolver.js'

export interface RegistryOptions {
  target?: string
}

export interface RegistryComponents {
  tagResolvers: Map<string, Resolver>
  options?: RegistryOptions
}

export class Registry {
  private tagResolvers: Map<string, Resolver>
  private options: RegistryOptions

  static create(options: RegistryOptions): Registry {
    return new Registry({
      tagResolvers: new Map(),
      options,
    })
  }

  constructor({ tagResolvers }: RegistryComponents) {
    this.tagResolvers = tagResolvers
  }

  getTagResolver(tagIdentifier: string): Resolver | undefined {
    return this.tagResolvers.get(tagIdentifier)
  }

  loadModule(module: Module): void {
    this.tagResolvers = new Map([
      ...this.tagResolvers,
      ...Object.entries(module.getTagResolvers(this.options)),
    ])
  }
}
