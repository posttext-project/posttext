import Handlebars from 'handlebars'

import { Printer, RootInterpreter } from '../printer'
import { HtmlInterpreter } from '../interpreters/html'
import { TreeInterpreter } from '../interpreters/tree'
import { Command } from '../ast'
import { TextInterpreter } from '../interpreters/text'

export class HtmlPrinter extends Printer<string> {
  static new(): HtmlPrinter {
    const rootInterpreter = RootInterpreter.new()

    rootInterpreter.registerInterpreters({
      tree: new TreeInterpreter(),
      html: new HtmlInterpreter(),
      text: new TextInterpreter(),
    })

    return new HtmlPrinter({ rootInterpreter })
  }

  protected async run(
    application: Command[]
  ): Promise<string | null> {
    const template = Handlebars.compile(`
      {{{ body }}}
    `)

    return template({
      body: application
        .filter((command) => command.name === 'setData')
        .map((command) => command.data ?? '')
        .join(''),
    })
  }
}
