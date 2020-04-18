import { Resolver } from './resolver'

export interface ModuleConstructor {
  new (): Module
}

export interface Module {
  registerTagResolvers(): Record<string, Resolver>
}
