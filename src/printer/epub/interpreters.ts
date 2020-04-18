import { Interpreter } from '../interpreter'
import { Command } from '../command'
import { Dispatcher } from '../dispatcher'
import { TagInput } from '../../generator/resolver'

export interface TreeCommand extends Command {
  name: 'tree'
  data: TagInput
  current: Command
  children: Command[][]
}

export class TreeInterpreter implements Interpreter {
  interpret(command: Command, dispatcher: Dispatcher): Command {
    return dispatcher.dispatch(
      command.current,
      new TreeDispatcher({
        parent: dispatcher,
        command: <TreeCommand>command
      })
    )
  }
}

export interface TreeDispatcherStruct {
  parent: Dispatcher
  command: TreeCommand
}

export class TreeDispatcher implements Dispatcher {
  parent: Dispatcher
  command: TreeCommand

  constructor({ parent, command }: TreeDispatcherStruct) {
    this.parent = parent
    this.command = command
  }

  dispatch(command: Command, dispatcher: Dispatcher): Command {
    if (command.name === 'textContent') {
      return {
        name: '#html',
        links: [],
        scripts: []
      }
    }

    return this.parent.dispatch(command, dispatcher)
  }
}

export class HtmlInterpreter implements Interpreter {
  interpret(command: Command, dispatcher: Dispatcher): Command {
    return {
      name: '#html',
      links: [],
      scripts: []
    }
  }
}
