import { Resolver } from './resolver'
import { RegistryOptions } from './registry';

export interface Module {
  getTagResolvers(
    options: RegistryOptions
  ): Record<string, Resolver>
}
