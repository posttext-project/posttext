/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cursor } from 'cursornext'

import { Parser } from '../index.js'
import { runParse } from './helpers/index.js'

describe('Parser', () => {
  describe('parseAttributes()', () => {
    let parser: Parser

    beforeAll(() => {
      parser = Parser.create()
    })

    test('parse an parameter', () => {
      runParse(
        `
          \\grid🌵(2)🌵 {
            \\section {
              Lorem Ipsum
            };

            \\section {
              Lorem ipsum dolor sit amet, consectetur adipiscing
              elit. Curabitur nulla ex, accumsan ac lacinia id,
              porttitor sed arcu. 
            }
          };
        `,
        `
          - type: Parameter
            value: '2'
        `,
        (cursor: Cursor) => parser.parseParameters(cursor)
      )
    })

    test('parse multiple parameters', () => {
      runParse(
        `
          \\list🌵(1, 2, 3, 4)🌵 {};
        `,
        `
          - type: Parameter
            value: '1'
          - type: Parameter
            value: '2'
          - type: Parameter
            value: '3'
          - type: Parameter
            value: '4'
        `,
        (cursor: Cursor) => parser.parseParameters(cursor)
      )
    })
  })
})
