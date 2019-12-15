import { TagNode, BlockChildNode, DocumentNode } from '../parser'
import { Scope } from './scope'

export type MacroResolver = (
  tagNode: TagNode,
  scope: Scope,
  options?: Object
) => IterableIterator<BlockChildNode>

export type TagResolver = (
  tagNode: TagNode,
  scope: Scope,
  options?: Object
) => IterableIterator<BlockChildNode>

export type DirectiveResolver = (
  tagNode: TagNode,
  scope: Scope,
  options?: Object
) => IterableIterator<BlockChildNode>

export type AstProcessor = (
  ast: DocumentNode,
  scope: Scope,
  options?: Object
) => DocumentNode

export interface DependencyDescriptor {
  name: string
  type: string
  version?: string
  link?: string
}

export interface PackageOptions {
  deps?: DependencyDescriptor[]
  macroResolvers?: Map<string, MacroResolver>
  tagResolvers?: Map<string, TagResolver>
  directiveResolvers?: Map<string, DirectiveResolver>
}

export class Package {
  deps: DependencyDescriptor[]

  macroResolvers: Map<string, MacroResolver>

  tagResolvers: Map<string, TagResolver>
  directiveResolvers: Map<string, DirectiveResolver>

  preprocessors: AstProcessor[] = []
  postprocessors: AstProcessor[] = []

  constructor(options: PackageOptions = {}) {
    this.deps = options.deps || []

    this.macroResolvers = options.macroResolvers || new Map()

    this.tagResolvers = options.tagResolvers || new Map()
    this.directiveResolvers =
      options.directiveResolvers || new Map()
  }

  static create() {
    return new Package()
  }

  defineDeps(deps: DependencyDescriptor[]) {
    for (const dep of deps) {
      this.defineDep(dep)
    }
  }

  defineDep(dep: DependencyDescriptor) {
    this.deps.push(dep)
  }

  addPreprocessor(callback: AstProcessor) {
    this.preprocessors.push(callback)
  }

  addPostprocessor(callback: AstProcessor) {
    this.postprocessors.push(callback)
  }

  getPreprocessors() {
    return this.preprocessors
  }

  getPostprocessors() {
    return this.postprocessors
  }

  removePreprocessors() {
    this.preprocessors = []
  }

  removePostprocessors() {
    this.postprocessors = []
  }

  defineMacros(macroResolvers: Record<string, MacroResolver>) {
    for (const [macroName, resolver] of Object.entries(
      macroResolvers
    )) {
      this.defineMacro(macroName, resolver)
    }
  }

  defineMacro(macroName: string, resolver: MacroResolver) {
    this.macroResolvers.set(macroName, resolver)
  }

  hasMacro(macroName: string): boolean {
    return this.macroResolvers.has(macroName)
  }

  getMacro(macroName: string): MacroResolver {
    return this.macroResolvers.get(macroName)
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

  hasTag(tagName: string) {
    return this.tagResolvers.has(tagName)
  }

  removeTag(tagName: string) {
    this.tagResolvers.delete(tagName)
  }

  getTag(tagName: string): TagResolver {
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

  getDirective(tagName: string): DirectiveResolver {
    return this.directiveResolvers.get(tagName)
  }
}
