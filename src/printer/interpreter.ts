import { Command } from './command'
import { Dispatcher } from './dispatcher'

export interface Interpreter {
  interpret(command: Command, dispatcher: Dispatcher): Command
}
