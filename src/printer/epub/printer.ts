import { Printer, RootInterpreter } from '../printer'
import {
  HtmlInterpreter,
  TreeInterpreter
} from './interpreters'

export class EpubPrinter extends Printer {
  static new(): EpubPrinter {
    const rootInterpreter = RootInterpreter.new()

    rootInterpreter.registerInterpreters({
      tree: new TreeInterpreter(),

      html: new HtmlInterpreter()
    })

    return new EpubPrinter({ rootInterpreter })
  }
}
