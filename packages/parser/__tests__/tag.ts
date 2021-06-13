/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cursor } from 'cursornext'

import { Parser } from '../src'
import { runParse } from './helpers'

describe('Parser', () => {
  describe('parseTag()', () => {
    let parser: Parser

    beforeAll(() => {
      parser = Parser.create()
    })

    test('tag should be parsed correctly', () => {
      runParse(
        `
          🌵\\bold {Hello, World!};🌵
        `,
        `
          type: Tag
          id:
            type: Identifier
            name: bold
          params: []
          attrs: []
          blocks:
            - type: Block
              body:
                - type: Text
                  value: Hello, World!
        `,
        (cursor: Cursor) => parser.parseTag(cursor)
      )
    })
  })
})
