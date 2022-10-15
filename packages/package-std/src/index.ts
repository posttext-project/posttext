/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Module, Package } from '@posttext/posttext'

import { StdModule } from './std/index.js'

export default class StdPackage implements Package {
  getRootModule(): Module {
    return new StdModule()
  }
}
