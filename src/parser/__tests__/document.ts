import { Parser } from '..'
import { runParse } from './helpers'
import { Cursor } from 'cursornext'

describe('Parser', () => {
  describe('parseDocument()', () => {
    let parser: Parser

    beforeAll(() => {
      parser = Parser.new()
    })

    test('document should be parsed correctly', () => {
      runParse(
        `
          🌵
            \\title {Lorem Ipsum};

            \\section {
              \\title {What is Lorem Ipsum?};

              \\paragraph {
                Lorem Ipsum is simply dummy text of the printing
                and typesetting industry. Lorem Ipsum has been
                the industry's standard dummy text ever since
                the 1500s, when an unknown printer took a galley
                of type and scrambled it to make a type specimen
                book. It has survived not only five centuries,
                but also the leap into electronic typesetting,
                remaining essentially unchanged. It was
                popularised in the 1960s with the release of
                Letraset sheets containing Lorem Ipsum passages,
                and more recently with desktop publishing software
                like Aldus PageMaker including versions of
                Lorem Ipsum.
              };
            };
      🌵`,
        `
          type: Document
          body:
            - type: Text
              value: ''
            - type: Tag
              id:
                type: Identifier
                name: title
              params: []
              attrs: []
              blocks:
                - type: Block
                  body:
                    - type: Text
                      value: Lorem Ipsum     
            - type: Text
              value: ''
            - type: Tag
              id:
                type: Identifier
                name: section
              params: []
              attrs: []
              blocks:
                - type: Block
                  body:
                    - type: Text
                      value: ''
                    - type: Tag
                      id:
                        type: Identifier
                        name: title
                      params: []
                      attrs: []
                      blocks:
                        - type: Block
                          body:
                            - type: Text
                              value: What is Lorem Ipsum?
                    - type: Text
                      value: ''
                    - type: Tag
                      id:
                        type: Identifier
                        name: paragraph
                      params: []
                      attrs: []
                      blocks:
                        - type: Block
                          body:
                            - type: Text
                              value: |-2
                                Lorem Ipsum is simply dummy text of the printing
                                and typesetting industry. Lorem Ipsum has been
                                the industry's standard dummy text ever since
                                the 1500s, when an unknown printer took a galley
                                of type and scrambled it to make a type specimen
                                book. It has survived not only five centuries,
                                but also the leap into electronic typesetting,
                                remaining essentially unchanged. It was
                                popularised in the 1960s with the release of
                                Letraset sheets containing Lorem Ipsum passages,
                                and more recently with desktop publishing software
                                like Aldus PageMaker including versions of
                                Lorem Ipsum.
                    - type: Text
                      value: ''
            - type: Text
              value: ''
        `,
        (cursor: Cursor) => parser.parseDocument(cursor)
      )
    })
  })
})
