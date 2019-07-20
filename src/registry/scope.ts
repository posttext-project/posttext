import { Registry } from './registry'
import {
  Package,
  TagResolver,
  DirectiveResolver
} from './package'
import { TagNode, TextNode } from '../parser'
import { resolveIdentifier } from './identifier'

export interface ScopeItem {
  clone(): ScopeItem
}

export class Scope {
  items: Map<Symbol, ScopeItem>

  preprocessors: ((ast: Node, scope: Scope) => Node)[]
  postprocessors: ((ast: Node, scope: Scope) => Node)[]

  registry: Registry

  globalPackage: Package
  namespacedPackages: Map<string, Package>

  id: number = 1

  constructor(scope?: Scope) {
    this.items = scope ? new Map(scope.items) : new Map()

    if (scope) {
      this.registry = scope.registry

      this.globalPackage = scope.globalPackage
      this.namespacedPackages = scope.namespacedPackages

      this.preprocessors = scope.preprocessors
      this.postprocessors = scope.postprocessors
    } else {
      this.registry = new Registry()

      this.globalPackage = Package.create()
      this.namespacedPackages = new Map()

      this.preprocessors = []
      this.postprocessors = []
    }
  }

  static create() {
    return new Scope()
  }

  clone() {
    return new Scope(this)
  }

  getItem(symbol: Symbol): ScopeItem {
    return this.items.get(symbol)
  }

  setItem(symbol: Symbol, item: ScopeItem) {
    return this.items.set(symbol, item)
  }

  setRegistry(registry: Registry) {
    this.registry = registry
  }

  getRegistry() {
    return this.registry
  }

  preprocess(callback: (ast: Node, scope: Scope) => Node) {
    this.preprocessors.push(callback)

    return () => {
      const index = this.preprocessors.indexOf(callback)

      this.preprocessors.splice(index, 1)
    }
  }

  postprocess(callback: (ast: Node, scope: Scope) => Node) {
    this.postprocessors.push(callback)

    return () => {
      const index = this.postprocessors.indexOf(callback)

      this.postprocessors.splice(index, 1)
    }
  }

  generateId() {
    ++this.id

    return this.id
  }

  usePackage(packageName: string) {
    const pkg = this.registry.findPackage(packageName)

    if (pkg) {
      this.namespacedPackages.set(packageName, pkg)
    }
  }

  importPackage(packageName: string) {
    const pkg = this.registry.findPackage(packageName)

    if (pkg) {
      this.globalPackage = this.globalPackage.merge(pkg)
    }
  }

  findTagResolver(tagIdentifier: string): TagResolver | false {
    const [namespace, tagName] = resolveIdentifier(
      tagIdentifier
    )

    if (namespace) {
      const pkg = this.namespacedPackages.get(namespace)

      if (!pkg) {
        return false
      }

      const resolver = pkg.findTagResolver(tagName)

      return resolver ? resolver : false
    }

    const resolver = this.globalPackage.findTagResolver(tagName)

    return resolver ? resolver : false
  }

  findDirectiveResolver(
    directiveIdentifier: string
  ): DirectiveResolver | false {
    const [namespace, tagName] = resolveIdentifier(
      directiveIdentifier
    )

    if (namespace) {
      const pkg = this.namespacedPackages.get(namespace)

      if (!pkg) {
        return false
      }

      const resolver = pkg.findDirectiveResolver(tagName)

      return resolver ? resolver : false
    }

    const resolver = this.globalPackage.findDirectiveResolver(
      tagName
    )

    return resolver ? resolver : false
  }

  resolve(
    nodes: (TagNode | TextNode)[],
    options: Object = {}
  ): (TagNode | TextNode)[] {
    return <(TagNode | TextNode)[]>nodes
      .map(node => {
        switch (node.type) {
          case 'Tag':
            const scope = this.clone()
            const resolver = this.findTagResolver(node.id.name)

            const pkg = Package.create()

            return resolver
              ? resolver(node, scope, pkg, options)
              : node

          case 'Text':
            return node
        }

        return node
      })
      .filter(node => !!node)
  }
}
