/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

 import { compile as _compile } from 'handlebars'
import { default as memoizee } from 'memoizee'

export const compile: <T = any>(
  input: any,
  options?: CompileOptions | undefined
) => HandlebarsTemplateDelegate<T> = memoizee(_compile)

export default {
  compile,
}
