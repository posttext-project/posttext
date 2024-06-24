/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { ModuleDefinition, ModuleResolver } from './module'
import { TagDefinition } from './tag'

export interface Scope extends ModuleResolver {
  useModule(moduleName: string): Scope
}

export function createScope(
  moduleDefinitionList: Record<string, ModuleDefinition>,
  tagResolverMap: Record<string, TagDefinition> = {}
): Scope {
  const scope = {
    hasTagResolver(tagName: string): boolean {
      return !!tagResolverMap[tagName]
    },
    getTagDefinition(tagName: string): TagDefinition {
      return tagResolverMap[tagName]
    },
    useModule(moduleName: string): Scope {
      const moduleDefinition = moduleDefinitionList[moduleName]
      if (!moduleDefinition) {
        throw new Error(`Module "${moduleName}" not found`)
      }

      return createScope(moduleDefinitionList, {
        ...tagResolverMap,
        ...moduleDefinition.tagDefinitionsFactory(),
      })
    },
  }

  return scope
}
