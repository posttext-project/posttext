import { Command } from './command'
import { Node } from '../ast'

type Modifier = 'private'

export type Dispatch = (
  node: Node,
  command: Command
) => AsyncGenerator<Command, any, any>

export interface Interpreter {
  modifier?: Modifier

  interpret(
    node: Node,
    command: Command,
    dispatch: Dispatch
  ): AsyncGenerator<Command, any, any>
}
