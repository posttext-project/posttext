import Handlebars from 'handlebars'

import { Interpreter } from '../interpreter'
import { Command } from '../command'

export interface TextCommand {
  name: 'text'
  content: string
}

export class TextInterpreter implements Interpreter {
  interpret(command: Partial<TextCommand>): Command[] {
    return [
      {
        name: 'setData',
        data: command.content ?? '',
      },
    ]
  }
}
