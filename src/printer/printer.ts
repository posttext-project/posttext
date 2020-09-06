import { DocumentNode, Node } from '../ast'
import { Interpreter } from './interpreter'
import { Command } from './command'
import { Generator } from '../registry'

export interface PrinterComponents {
  generator: Generator
}

export interface PrinterInput {
  ast: DocumentNode
}

export interface PrinterResult {}

export class Printer {
  interpreters: Map<string, Interpreter>
  generator: Generator

  static new(components: PrinterComponents) {
    return new Printer(components)
  }

  constructor({ generator }: PrinterComponents) {
    this.interpreters = new Map()
    this.generator = generator
  }

  registerInterpreters(
    interpreters: Record<string, Interpreter>
  ) {
    for (const [name, interpreter] of Object.entries(
      interpreters
    )) {
      this.interpreters.set(name, interpreter)
    }
  }

  print(input: PrinterInput) {
    const { ast } = input

    this.interpret(ast, {
      name: 'render',
    })
  }

  async *interpret(
    node: Node,
    command: Command
  ): AsyncGenerator<Command, any, any> {
    switch (node.type) {
      case 'Tag':
        if (command.name === 'render') {
          const resolver = this.generator.getTagResolver(
            node.id.name
          )

          if (!resolver) {
            return
          }

          const iter = resolver.resolve()
          let iterResult = await iter.next()
          resolverLoop: while (!iterResult.done) {
            const resolverCommand = iterResult.value

            const interpreter = this.interpreters.get(
              resolverCommand.name
            )

            if (
              !interpreter ||
              interpreter.modifier === 'private'
            ) {
              break
            }

            const commandIter = interpreter.interpret(
              node,
              resolverCommand,
              this.interpret.bind(this)
            )

            let commandIterResult = await commandIter.next()
            while (!commandIterResult.done) {
              if (commandIterResult.value.name === 'error') {
                break resolverLoop
              }

              yield commandIterResult.value
            }

            iterResult = await iter.next(
              commandIterResult.value
            )
          }

          return
        } else {
          const interpreter = this.interpreters.get(
            command.name
          )

          if (!interpreter) {
            return
          }

          yield* interpreter.interpret(
            node,
            command,
            this.interpret.bind(this)
          )
        }

        return

      default:
        const interpreter = this.interpreters.get(command.name)

        // TODO: Handle invalid command.
        if (!interpreter) {
          return
        }

        yield* interpreter.interpret(
          node,
          command,
          this.interpret.bind(this)
        )
    }
  }
}
