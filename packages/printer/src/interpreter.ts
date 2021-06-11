/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Command } from './command'
import { Data } from './data'
import { Registry } from '@posttext/registry'

type Modifier = 'private'

export interface Context {
  dispatch: Dispatch
  registry: Registry
  interpreters: Map<string, Interpreter>
  getState(key: string | symbol): Record<string | symbol, any>
  clone(): Context
}

export type Dispatch = (
  command: Command
) => AsyncGenerator<Data, any, any>

export interface Interpreter {
  modifier?: Modifier

  preload?(
    command: Command,
    context: Context
  ): AsyncGenerator<Data, any, any>

  interpret(
    command: Command,
    context: Context
  ): AsyncGenerator<Data, any, any>
}
