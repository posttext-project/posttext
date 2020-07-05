import { Interpreter } from '../interpreter'
import { Command } from '../command'

export interface TextCommand {
  name: 'text'
  content: string
}

export class TextInterpreter implements Interpreter {
  interpret(command: Command): Command[] {
    return [
      {
        name: 'setData',
        data: command.content ?? '',
      },
    ]
  }
}
