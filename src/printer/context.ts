import { Context, Dispatch, Interpreter } from './interpreter'
import { Command } from './command'
import { Data } from './data'
import { Registry } from '../registry'

export interface AnonymousContextComponents {
  dispatch: Dispatch
  interpreters: Map<string, Interpreter>
  registry: Registry
  stateMap: Map<string, Interpreter>
}

export class AnonymousContext implements Context {
  private _dispatch: Dispatch
  private _interpreters: Map<string, Interpreter>
  private _registry: Registry

  private _stateMap: Map<string, any>

  static create(
    components: AnonymousContextComponents
  ): AnonymousContext {
    return new AnonymousContext(components)
  }

  constructor({
    dispatch,
    interpreters,
    registry,
    stateMap,
  }: AnonymousContextComponents) {
    this._dispatch = dispatch
    this._interpreters = interpreters
    this._registry = registry
    this._stateMap = stateMap
  }

  async *dispatch(
    command: Command
  ): AsyncGenerator<Data, any, any> {
    return yield* this._dispatch(command)
  }

  get interpreters(): Map<string, Interpreter> {
    return this._interpreters
  }

  get registry(): Registry {
    return this._registry
  }

  getState(name: string): Record<string, any> {
    const state = this._stateMap.get(name)

    if (!state) {
      const newState = {}

      this._stateMap.set(name, newState)

      return newState
    }

    return state
  }
}
