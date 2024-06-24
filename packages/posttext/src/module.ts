/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { TagDefinition } from './tag'

export interface ModuleResolver {
  hasTagResolver(tagName: string): boolean
  getTagDefinition(tagName: string): TagDefinition
}

export interface ModuleDefinition {
  name: string
  tagDefinitionsFactory: () => Record<string, TagDefinition>
}
