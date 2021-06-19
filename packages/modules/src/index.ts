/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import path from 'path'
import url from 'url'

export { StdModule } from './std/index.js'

export const resolve = {
  modules: [
    path.resolve(
      path.dirname(url.fileURLToPath(import.meta.url)),
      '../node_modules'
    ),
  ],
}
