import Handlebars from 'handlebars'

import { Interpreter } from '../interpreter'
import { Command } from '../command'
import { Dispatcher } from '../dispatcher'

export interface HtmlCommand {
  name: 'html'
  template: string
  data: Command
  transform?(data: any): Record<string, any>
}

export class HtmlInterpreter implements Interpreter {
  interpret(
    command: Partial<HtmlCommand>,
    dispatcher: Dispatcher
  ): Command[] {
    if (command.template) {
      const result = command.data
        ? dispatcher.dispatch(command.data, dispatcher)
        : []

      const data = result
        .filter(command => command.name === 'setData')
        .reduce(
          (accum, command) => ({
            ...accum,
            ...(command.data ?? {})
          }),
          {}
        )

      const template = Handlebars.compile(
        command?.template ?? ''
      )

      const body = template(data)

      return [
        {
          name: 'setData',
          data: body
        }
      ]
    }

    return []
  }
}
