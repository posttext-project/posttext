import { Printer, RootInterpreter } from '../printer'
import { HtmlInterpreter } from '../interpreters/html'
import { TreeInterpreter } from '../interpreters/tree'
import { Command } from '../command'

export class HtmlPrinter extends Printer<Command[]> {
  static new(): HtmlPrinter {
    const rootInterpreter = RootInterpreter.new()

    rootInterpreter.registerInterpreters({
      tree: new TreeInterpreter(),
      html: new HtmlInterpreter()
    })

    return new HtmlPrinter({ rootInterpreter })
  }

  protected async run(
    application: Command[]
  ): Promise<Command[] | null> {
    return application
  }
}
