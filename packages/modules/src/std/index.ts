/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Module } from '@posttext/registry'
import { Resolver, RegistryOptions } from '@posttext/registry'

import { tagResolvers } from './resolvers.js'

export class StdModule implements Module {
  static create(): Module {
    return new StdModule()
  }

  getTagResolvers(
    options: RegistryOptions
  ): Record<string, Resolver> {
    return tagResolvers(options)
  }
}

export const module = new StdModule()
export const moduleFactory = StdModule
