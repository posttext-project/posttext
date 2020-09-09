import { Command } from './command'
import { Data } from './data'
import { Registry } from '../registry'

type Modifier = 'private'

export interface Context {
  dispatch: Dispatch
  registry: Registry
  interpreters: Map<string, Interpreter>
}

export type Dispatch = (
  command: Command
) => AsyncGenerator<Data, any, any>

export interface Interpreter {
  modifier?: Modifier

  preload?(
    command: Command,
    context: Context
  ): AsyncGenerator<Data, any, any>

  interpret(
    command: Command,
    context: Context
  ): AsyncGenerator<Data, any, any>
}
