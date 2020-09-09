import { Cursor } from 'cursornext'

import { Parser } from '..'
import { runParse } from './helpers'

describe('Parser', () => {
  describe('parseVerbatim()', () => {
    let parser: Parser

    beforeAll(() => {
      parser = Parser.create()
    })

    test('verbatim should be parsed correctly', () => {
      runParse(
        `
          🌵\\code(javascript) ==={
            function sum(a, b) {
              return a + b;
            }

            console.log(sum(1, 2))
          }===;🌵
        `,
        `
          type: Tag
          id:
            type: Identifier
            name: code
          attrs: []
          params:
            - type: Parameter
              value: javascript
          blocks:
            - type: Block
              body:
                - type: Text
                  value: |-2
                    function sum(a, b) {
                      return a + b;
                    }

                    console.log(sum(1, 2))
        `,
        (cursor: Cursor) => parser.parseTag(cursor)
      )
    })
  })
})
