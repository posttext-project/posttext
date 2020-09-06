import { Resolver } from './resolver'
import { Module } from './module'

export type GeneratorInput = {
  target: string
}

export interface GeneratorOptions {
  rootModule?: Module
  target: string
}

export class Registry {
  private tagResolvers: Map<string, Resolver>

  static new(options: GeneratorOptions): Registry {
    const tagResolvers =
      options.rootModule?.getTagResolvers({
        target: options.target,
      }) ?? {}

    return new Registry({
      tagResolvers: new Map(Object.entries(tagResolvers)),
    })
  }

  constructor({
    tagResolvers,
  }: {
    tagResolvers: Map<string, Resolver>
  }) {
    this.tagResolvers = tagResolvers
  }

  getTagResolver(tagIdentifier: string): Resolver | undefined {
    return this.tagResolvers.get(tagIdentifier)
  }
}
