/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Command } from './command.js'

export interface Resolver {
  preload?(): AsyncGenerator<Command, void, any>

  resolve(): AsyncGenerator<Command, void, any>
}
