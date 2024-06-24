/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export interface HelperList {
  get(name: string | symbol): any
}

export function createHelperList(
  helpers: Record<string | symbol, any>
): HelperList {
  return {
    get(name: string | symbol): any {
      return helpers[name]
    },
  }
}
