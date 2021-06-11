/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Context, Dispatch, Interpreter } from './interpreter'
import { Command } from './command'
import { Data } from './data'
import { Registry } from '@posttext/registry'

export interface AnonymousContextComponents {
  dispatch: Dispatch
  interpreters: Map<string, Interpreter>
  registry: Registry
  stateMap: Map<string | symbol, Interpreter>
}

export class AnonymousContext implements Context {
  private _dispatch: Dispatch
  private _interpreters: Map<string, Interpreter>
  private _registry: Registry

  private _stateMap: Map<string | symbol, any>

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

  getState(key: string | symbol): Record<string | symbol, any> {
    const state = this._stateMap.get(key)

    if (!state) {
      const newState = {}

      this._stateMap.set(key, newState)

      return newState
    }

    return state
  }

  clone(): AnonymousContext {
    return AnonymousContext.create({
      dispatch: this._dispatch,
      interpreters: this._interpreters,
      registry: this._registry,
      stateMap: this._stateMap,
    })
  }
}
