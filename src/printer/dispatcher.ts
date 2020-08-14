import { Command } from './ast'

export interface Dispatcher {
  dispatch(command: Command, dispatcher: Dispatcher): Command[]
}
