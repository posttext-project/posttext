import { Command } from '../printer/command'

export interface ResolverInput {
  target: string
}

export interface TagInput {
  params: string[]
  attrs: Record<string, string>
}

export interface Resolver {
  load?(): void

  resolve(): AsyncGenerator<Command, void, any>
}
