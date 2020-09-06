import { Module } from '../../registry/module'
import {
  Resolver,
  ResolverInput,
} from '../../registry/resolver'

import { tagResolvers } from './resolvers'

export class StdModule implements Module {
  getTagResolvers(
    input: ResolverInput
  ): Record<string, Resolver> {
    return tagResolvers(input)
  }
}

export const m = new StdModule()

export default StdModule
