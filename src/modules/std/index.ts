import { Module } from '../../registry/module'
import { Resolver, RegistryOptions } from '../../registry'

import { tagResolvers } from './resolvers'

export class StdModule implements Module {
  getTagResolvers(
    options: RegistryOptions
  ): Record<string, Resolver> {
    return tagResolvers(options)
  }
}

export const m = new StdModule()

export default StdModule
