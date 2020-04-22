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

export interface ComposeCommand extends Command {
  name: 'compose'
  reduce: Command[]
  transform?(data: any): Record<string, any>
}

export interface GetAttrsCommand extends Command {
  name: 'getAttrs'
  transform?(data: TagInput): any
}

export interface TextContentCommand extends Command {
  name: 'textContent'
  offset: number
  transform?(data: any): any
}

export interface GetBlockCommand extends Command {
  name: 'getBlock'
  offset: number
  transform?(data: any): any
}

export type TreeChildCommand =
  | Partial<ComposeCommand>
  | Partial<GetAttrsCommand>
  | Partial<TextContentCommand>
  | Partial<GetBlockCommand>

export class TreeInterpreter implements Interpreter {
  interpret(
    command: Command,
    dispatcher: Dispatcher
  ): Command[] {
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

  dispatch(
    command: TreeChildCommand,
    dispatcher: Dispatcher
  ): Command[] {
    if (command.name === 'compose') {
      if (!command.reduce) {
        return []
      }

      const data = command.reduce
        .filter(subcommand => subcommand.name === 'setData')
        .reduce(
          (accum, subcommand) => ({
            ...accum,
            subcommand
          }),
          {}
        )

      return [
        {
          name: 'setData',
          data: command.transform?.(data) ?? data
        },
        ...command.reduce.filter(
          subcommand => subcommand.name !== 'setData'
        )
      ]
    }

    if (command.name === 'getAttrs') {
      return [
        {
          name: 'setData',
          data: command.transform?.(this.command.data) ?? {}
        }
      ]
    }

    if (command.name === 'textContent') {
      return [
        {
          name: 'setData',
          data: 'Lorem ipsum'
        }
      ]
    }

    if (command.name === 'getBlock') {
      return [
        {
          name: 'setData',
          data: 'Lorem ipsum'
        }
      ]
    }

    return this.parent.dispatch(command as Command, dispatcher)
  }
}
