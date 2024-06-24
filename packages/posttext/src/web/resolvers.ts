/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { ModuleDefinition } from '../module'
import { TagDefinition } from '../tag'

function createTagDefinitions(): Record<string, TagDefinition> {
  return {}
}

export default {
  name: 'web',
  tagDefinitionsFactory: createTagDefinitions,
} as ModuleDefinition
