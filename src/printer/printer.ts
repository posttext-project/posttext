import { Command } from './command'
import { Interpreter } from './interpreter'
import { Dispatcher } from './dispatcher'

export interface PrinterInput {
  rootCommand: Command
}

export interface Printer<T> {
  print(input: PrinterInput): Promise<T | null>
}

export interface PrinterStruct {
  rootInterpreter: RootInterpreter
}

export class Printer<T> {
  rootInterpreter: RootInterpreter

  static new() {
    return new Printer({
      rootInterpreter: RootInterpreter.new(),
    })
  }

  constructor({ rootInterpreter }: PrinterStruct) {
    this.rootInterpreter = rootInterpreter
  }

  print(input: PrinterInput): Promise<T | null> {
    const { rootCommand } = input

    const dispatcher = new RootDispatcher({
      rootInterpreter: this.rootInterpreter,
    })

    const application = this.rootInterpreter.interpret(
      rootCommand,
      dispatcher
    )

    return this.run(application)
  }

  protected async run(
    application: Command[]
  ): Promise<T | null> {
    return null
  }
}

export interface RootInterpreterStruct {
  interpreters: Map<string, Interpreter>
}

export class RootInterpreter implements Interpreter {
  interpreters: Map<string, Interpreter>

  static new() {
    return new RootInterpreter()
  }

  constructor({
    interpreters,
  }: Partial<RootInterpreterStruct> = {}) {
    this.interpreters = interpreters ?? new Map()
  }

  registerInterpreters(
    interpreters: Record<string, Interpreter>
  ) {
    for (const [name, interpreter] of Object.entries(
      interpreters
    )) {
      this.registerInterpreter(name, interpreter)
    }
  }

  registerInterpreter(name: string, interpreter: Interpreter) {
    this.interpreters.set(name, interpreter)
  }

  interpret(
    command: Command,
    dispatcher: Dispatcher
  ): Command[] {
    if (this.interpreters.has(command.name)) {
      return (
        this.interpreters
          .get(command.name)
          ?.interpret(command, dispatcher) ?? []
      )
    }

    return []
  }
}

export interface RootDispatcherStruct {
  rootInterpreter: RootInterpreter
}

export class RootDispatcher implements Dispatcher {
  rootInterpreter: RootInterpreter

  constructor({ rootInterpreter }: RootDispatcherStruct) {
    this.rootInterpreter = rootInterpreter
  }

  dispatch(
    command: Command,
    dispatcher: Dispatcher
  ): Command[] {
    return this.rootInterpreter.interpret(command, dispatcher)
  }
}
