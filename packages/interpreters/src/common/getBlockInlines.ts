/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Data } from '@posttext/registry'

export async function* textTransformDefault(
  content: string
): AsyncGenerator<Data, any, any> {
  yield {
    name: 'html',
    template: `{{{ data.content }}}`,
    data: {
      content,
    },
  }
}

export async function* inlinesTransformDefault(
  content: string
): AsyncGenerator<Data, any, any> {
  yield {
    name: 'html',
    template: `{{{ data.content }}}`,
    data: {
      content,
    },
  }
}

export async function* blockTransformDefault(
  _content: string
): AsyncGenerator<Data, any, any> {
  /* pass */
}
