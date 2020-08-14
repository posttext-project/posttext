import { Command } from '../printer/ast'

export interface ResolverInput {
  target: string
}

export interface TagInput {
  params: string[]
  attrs: Record<string, string>
}

export interface Resolver {
  load?(): void

  resolve(input: ResolverInput): Command
}
