import { Command } from '../printer/command'

export interface Resolver {
  load?(): AsyncGenerator<Command, void, any>

  resolve(): AsyncGenerator<Command, void, any>
}
