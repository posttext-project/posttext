import { TagNode, TextNode } from '../parser'
import { Scope } from './scope'

export type TagResolver = (
  tagNode: TagNode,
  scope: Scope,
  pkg: Package,
  options?: Object
) => TagNode | TextNode | false

export type DirectiveResolver = (
  tagNode: TagNode,
  scope: Scope,
  pkg: Package,
  options?: Object
) => TagNode | TextNode | false

export interface DependencyDescriptor {
  name: string
  type?: string
  version?: string
  link?: string
}

export interface PackageOptions {
  namespace?: string
  deps?: DependencyDescriptor[]
  tagResolvers?: Map<string, TagResolver>
  directiveResolvers?: Map<string, DirectiveResolver>
}

export class Package {
  namespace: string | false

  deps: DependencyDescriptor[]

  tagResolvers: Map<string, TagResolver>
  directiveResolvers: Map<string, DirectiveResolver>

  constructor(options: PackageOptions = {}) {
    this.namespace = options.namespace || false

    this.deps = options.deps || []

    this.tagResolvers = options.tagResolvers || new Map()
    this.directiveResolvers =
      options.directiveResolvers || new Map()
  }

  static create() {
    return new Package()
  }

  merge(pkg: Package): Package {
    return Package.create()
  }

  setNamespace(namespace: string | false) {
    this.namespace = namespace
  }

  defineDeps(deps: DependencyDescriptor[]) {
    for (const dep of deps) {
      this.defineDep(dep)
    }
  }

  defineDep(dep: DependencyDescriptor) {
    this.deps.push(dep)
  }

  defineTags(tagResolvers: Record<string, TagResolver>) {
    for (const [tagName, resolver] of Object.entries(
      tagResolvers
    )) {
      this.defineTag(tagName, resolver)
    }
  }

  defineTag(tagName: string, resolver: TagResolver) {
    this.tagResolvers.set(tagName, resolver)
  }

  removeTag(tagName: string) {
    this.tagResolvers.delete(tagName)
  }

  findTagResolver(tagName: string): TagResolver {
    return this.tagResolvers.get(tagName)
  }

  defineDirectives(
    directiveResolvers: Record<string, DirectiveResolver>
  ) {
    for (const [directiveName, resolver] of Object.entries(
      directiveResolvers
    )) {
      this.defineDirective(directiveName, resolver)
    }
  }

  defineDirective(
    directiveName: string,
    resolver: DirectiveResolver
  ) {
    this.directiveResolvers.set(directiveName, resolver)
  }

  removeDirective(tagName: string) {
    this.directiveResolvers.delete(tagName)
  }

  findDirectiveResolver(tagName: string): DirectiveResolver {
    return this.directiveResolvers.get(tagName)
  }
}
