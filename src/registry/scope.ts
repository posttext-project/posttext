import { Registry } from './registry'
import { Package, MacroResolver, AstProcessor } from './package'
import { BlockChildNode, Node } from '../parser'
import { resolveIdentifier } from './helpers'
import { createDocumentNode } from '../builder'
import { DocumentNode, TagNode } from '../parser/nodes'

export interface ScopeFeature {
  clone(): ScopeFeature
}

export interface Scope {
  clone(): Scope
}

export interface MacroScopeStruct {
  features: Map<Symbol, ScopeFeature>
  registry: Registry
  globalPackages: [string, Package][]
  packages: Map<string, Package>
}

export interface ResolverScopeStruct {
  features: Map<Symbol, ScopeFeature>
  packages: Map<string, Package>
}

export class MacroScope {
  features: Map<Symbol, ScopeFeature>
  registry: Registry
  globalPackages: [string, Package][]
  packages: Map<string, Package>

  constructor(scope?: MacroScopeStruct) {
    if (scope) {
      const {
        features,
        registry,
        globalPackages,
        packages
      } = scope

      this.features = features
      this.registry = registry
      this.globalPackages = globalPackages
      this.packages = packages
    } else {
      this.features = new Map()
      this.registry = Registry.create()
      this.globalPackages = []
      this.packages = new Map()
    }
  }

  static create(): MacroScope {
    return new MacroScope()
  }

  static fromRegistry(registry: Registry): MacroScope {
    return new MacroScope({
      features: new Map<Symbol, ScopeFeature>(),
      registry,
      globalPackages: <[string, Package][]>[],
      packages: new Map<string, Package>()
    })
  }

  clone(): MacroScope {
    return new MacroScope(this)
  }

  getFeature(symbol: Symbol): ScopeFeature {
    return this.features.get(symbol)
  }

  setFeature(symbol: Symbol, feature: ScopeFeature) {
    return this.features.set(symbol, feature)
  }

  usePackage(packageName: string) {
    const pkg = this.registry.findPackage(packageName)

    if (pkg) {
      this.packages.set(packageName, pkg)
    }
  }

  importPackage(packageName: string) {
    const pkg = this.registry.findPackage(packageName)

    if (pkg) {
      this.globalPackages.unshift([packageName, pkg])
    }
  }

  toResolverScope(): ResolverScope {
    return new ResolverScope({
      features: this.features,
      packages: this.packages
    })
  }

  expand(doc: DocumentNode): DocumentNode {
    return {
      type: 'Document',
      body: this.expandNodes(doc.body)
    }
  }

  expandNode(node: BlockChildNode): BlockChildNode[] {
    if (is)
  }

  expandNodes(nodes: BlockChildNode[]): BlockChildNode[] {

  }

  expandMacro(tag: TagNode): BlockChildNode[] {

  }

  expandMacros(macros: TagNode[]): BlockChildNode[] {

  }

  expandTag(tag: TagNode): BlockChildNode[] {
    return [tag]
  }
}

export class ResolverScope {
  features: Map<Symbol, ScopeFeature>
  packages: Map<string, Package>

  constructor(scope?: ResolverScopeStruct) {
    if (scope) {
      const { features, packages } = scope

      this.features = features
      this.packages = packages
    } else {
      this.features = new Map()
      this.packages = new Map()
    }
  }

  static create(): ResolverScope {
    return new ResolverScope()
  }

  clone(): ResolverScope {
    return new ResolverScope(this)
  }

  getFeature(symbol: Symbol): ScopeFeature {
    return this.features.get(symbol)
  }

  setFeature(symbol: Symbol, feature: ScopeFeature) {
    return this.features.set(symbol, feature)
  }

  resolve() {

  }
}
