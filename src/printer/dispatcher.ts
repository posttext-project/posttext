import { Command } from './command'

export interface Dispatcher {
  dispatch(command: Command, dispatcher: Dispatcher): Command
}
