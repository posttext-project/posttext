/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Command } from '@posttext/registry'

export const extractParagraphs = {
  text: async function* (
    textContent: string
  ): AsyncGenerator<Command, void, any> {
    const paragraphs = textContent
      .split(/(?:\n\r?[ ]?)+/)
      .filter((chunk) => !/^\s*$/.test(chunk))

    for (const [index, paragraph] of paragraphs.entries()) {
      yield {
        name: 'html',
        template: `{{{ data.content }}}`,
        type: 'text',
        data: {
          content: paragraph,
        },
      }

      if (index !== paragraphs.length - 1) {
        yield {
          name: 'html',
          type: 'hard-break',
        }
      }
    }
  },

  inlines: async function* (
    content: string
  ): AsyncGenerator<Command, void, any> {
    yield {
      name: 'html',
      template: `
        <p>
          {{{ data.content }}}
        </p>
      `,
      data: {
        content,
      },
    }
  },

  block: async function* (
    content: string
  ): AsyncGenerator<Command, void, any> {
    yield {
      name: 'html',
      template: `{{{ data.content }}}`,
      data: {
        content,
      },
    }
  },
}
