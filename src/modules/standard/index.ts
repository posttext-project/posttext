import { Module } from '../../generator/module'
import { Resolver } from '../../generator/resolver'

import { tagResolvers } from './resolvers'

export class StandardModule implements Module {
  registerTagResolvers(): Record<string, Resolver> {
    return tagResolvers
  }
}

export const m = new StandardModule()

export default StandardModule
