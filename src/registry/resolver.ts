import { Command } from '../printer/command'

export interface Resolver {
  load?(): void

  resolve(): AsyncGenerator<Command, void, any>
}
