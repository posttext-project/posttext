/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Cursor } from 'cursornext'

import { Parser } from '..'
import { runParse } from './helpers'

describe('Parser', () => {
  describe('parseAttributes()', () => {
    let parser: Parser

    beforeAll(() => {
      parser = Parser.create()
    })

    test('parse no attribute', () => {
      runParse(
        `
          \\paragraph 🌵[]🌵 {
            Lorem Ipsum is simply dummy text ofthe printing and
            typesetting industry.
          };
        `,
        `
          []
        `,
        (cursor: Cursor) => parser.parseAttributes(cursor)
      )
    })

    test('parse an attribute', () => {
      runParse(
        `
          \\paragraph 🌵[font-size = 14px]🌵 {
            Lorem Ipsum is simply dummy text ofthe printing and
            typesetting industry.
          };
        `,
        `
          - type: Attribute
            id:
              type: Identifier
              name: font-size
            value: 14px
        `,
        (cursor: Cursor) => parser.parseAttributes(cursor)
      )
    })

    test('parse an attribute on multiple lines', () => {
      runParse(
        `
          \\paragraph 🌵[
            font-size = 14px;
          ]🌵 {
            Lorem Ipsum is simply dummy text ofthe printing and
            typesetting industry.
          };
        `,
        `
          - type: Attribute
            id:
              type: Identifier
              name: font-size
            value: 14px
        `,
        (cursor: Cursor) => parser.parseAttributes(cursor)
      )
    })

    test('parse multiple attributes', () => {
      runParse(
        `
          \\paragraph 🌵[font-size = 14px; font-weight = bold]🌵 {
            Lorem Ipsum is simply dummy text ofthe printing and
            typesetting industry.
          };
        `,
        `
          - type: Attribute
            id:
              type: Identifier
              name: font-size
            value: 14px
          - type: Attribute
            id:
              type: Identifier
              name: font-weight
            value: bold
        `,
        (cursor: Cursor) => parser.parseAttributes(cursor)
      )
    })

    test('parse multiple attributes on multiple lines', () => {
      runParse(
        `
          \\paragraph 🌵[
            font-size = 14px;
            font-weight = bold;
          ]🌵 {
            Lorem Ipsum is simply dummy text ofthe printing and
            typesetting industry.
          };
        `,
        `
          - type: Attribute
            id:
              type: Identifier
              name: font-size
            value: 14px
          - type: Attribute
            id:
              type: Identifier
              name: font-weight
            value: bold
        `,
        (cursor: Cursor) => parser.parseAttributes(cursor)
      )
    })
  })
})
