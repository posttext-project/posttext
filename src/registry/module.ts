import { Resolver, ResolverInput } from './resolver'

export interface Module {
  getTagResolvers(
    input: ResolverInput
  ): Record<string, Resolver>
}
