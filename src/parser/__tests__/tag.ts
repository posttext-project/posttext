import { runParse } from './helpers'
import { Cursor } from 'cursornext'
import { Parser } from '..'

describe('Parser', () => {
  describe('parseTag()', () => {
    let parser: Parser

    beforeAll(() => {
      parser = Parser.new()
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
