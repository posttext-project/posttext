/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Module } from './module'
import { Resolver } from './resolver'

export interface RegistryOptions {
  target?: string
}

export interface RegistryFactoryComponents {
  rootModule?: Module
}

export interface RegistryComponents {
  tagResolvers: Map<string, Resolver>
}

export class Registry {
  private tagResolvers: Map<string, Resolver>

  static create(
    components: RegistryFactoryComponents,
    options?: RegistryOptions
  ): Registry {
    const tagResolvers =
      components.rootModule?.getTagResolvers({
        target: options?.target,
      }) ?? {}

    return new Registry({
      tagResolvers: new Map(Object.entries(tagResolvers)),
    })
  }

  constructor({ tagResolvers }: RegistryComponents) {
    this.tagResolvers = tagResolvers
  }

  getTagResolver(tagIdentifier: string): Resolver | undefined {
    return this.tagResolvers.get(tagIdentifier)
  }
}
