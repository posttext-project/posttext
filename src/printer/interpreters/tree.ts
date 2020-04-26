import { Interpreter } from '../interpreter'
import { Command } from '../command'
import { Dispatcher } from '../dispatcher'
import { TagInput } from '../../generator/resolver'

export interface TreeCommand extends Command {
  name: 'tree'
  data: TagInput
  current?: Command
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
    return command.current !== undefined &&
      command.current !== null
      ? dispatcher.dispatch(
          command.current,
          new TreeDispatcher({
            parent: dispatcher,
            command: command as TreeCommand,
          })
        )
      : []
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

      const result = command.reduce
        .map((subcommand) => this.dispatch(subcommand, this))
        .reduce(
          (accum, returnedCommands) => [
            ...accum,
            ...returnedCommands,
          ],
          []
        )

      const data = result
        .filter((subcommand) => subcommand.name === 'setData')
        .reduce(
          (accum, subcommand) => ({
            ...accum,
            ...(subcommand.data ?? {}),
          }),
          {}
        )

      const others = result.filter(
        (subcommand) => subcommand.name !== 'setData'
      )

      return [
        {
          name: 'setData',
          data: command.transform?.(data) ?? data,
        },
        ...others,
      ]
    }

    if (command.name === 'getAttrs') {
      return [
        {
          name: 'setData',
          data: command.transform?.(this.command.data) ?? {},
        },
      ]
    }

    if (command.name === 'textContent') {
      const result =
        command.offset !== null &&
        command.offset !== undefined &&
        this.command.children[command.offset]
          ? this.command.children[command.offset]
              .filter(
                (subcommand) => subcommand.name === 'text'
              )
              .map((subcommand) =>
                this.parent.dispatch(subcommand, dispatcher)
              )
              .reduce(
                (accum, subcommands) => [
                  ...accum,
                  ...subcommands,
                ],
                []
              )
          : []

      const data = result
        .filter((subcommand) => subcommand.name === 'setData')
        .map((subcommand) => subcommand.data ?? '')
        .join('')

      const others = result.filter(
        (subcommand) => subcommand.name !== 'setData'
      )

      return [
        {
          name: 'setData',
          data: command.transform?.(data) ?? data,
        },
        ...others,
      ]
    }

    if (command.name === 'getBlock') {
      const result =
        command.offset !== null &&
        command.offset !== undefined &&
        this.command.children[command.offset]
          ? this.command.children[command.offset]
              .map((subcommand) =>
                this.parent.dispatch(subcommand, dispatcher)
              )
              .reduce(
                (accum, subcommands) => [
                  ...accum,
                  ...subcommands,
                ],
                []
              )
          : []

      const data = result
        .filter((subcommand) => subcommand.name === 'setData')
        .map((subcommand) => subcommand.data ?? '')
        .join('')

      const others = result.filter(
        (subcommand) => subcommand.name !== 'setData'
      )

      return [
        {
          name: 'setData',
          data: command.transform?.(data) ?? data,
        },
        ...others,
      ]
    }

    return this.parent.dispatch(command as Command, dispatcher)
  }
}
