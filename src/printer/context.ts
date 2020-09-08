import { Context, Dispatch, Interpreter } from './interpreter'
import { Command } from './command'
import { Data } from './data'
import { Registry } from '../registry'

export interface AnonymousContextComponents {
  dispatch: Dispatch
  interpreters: Map<string, Interpreter>
  registry: Registry
}

export class AnonymousContext implements Context {
  private _dispatch: Dispatch
  private _interpreters: Map<string, Interpreter>
  private _registry: Registry

  static create(
    components: AnonymousContextComponents
  ): AnonymousContext {
    return new AnonymousContext(components)
  }

  constructor({
    dispatch,
    interpreters,
    registry,
  }: AnonymousContextComponents) {
    this._dispatch = dispatch
    this._interpreters = interpreters
    this._registry = registry
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
}
