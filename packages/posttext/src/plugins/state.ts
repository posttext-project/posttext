/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Plugin } from '../plugin'
import { CommandResolver } from '../resolver'

export class StatePlugin implements Plugin {
  getCommandResolvers(): Record<string, CommandResolver> {
    const state = new Map()

    return {
      async *getState(): AsyncGenerator<
        any,
        Map<string | symbol, any>,
        any
      > {
        return state
      },
    }
  }
}
