/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Module } from '@posttext/registry/module'
import { Resolver, RegistryOptions } from '@posttext/registry'

import { tagResolvers } from './std/resolvers'

export class StdModule implements Module {
  getTagResolvers(
    options: RegistryOptions
  ): Record<string, Resolver> {
    return tagResolvers(options)
  }
}

export const m = new StdModule()

export default StdModule
