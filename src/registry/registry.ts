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
