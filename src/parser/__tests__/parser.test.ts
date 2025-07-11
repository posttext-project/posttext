import { createParserState } from '../state';
import { parseDocument } from '../document';

describe('parseDocument', () => {
  it('should parse a document', () => {
    const state = createParserState(`
\\document{paper-a4};

\\package{std::*};

\\chapter{Introduction};

This is an introduction text.

\\list::* {
  \\item{Item 1};
  \\item{Item 2};
  \\item{Item 3};
};
`);
    const document = parseDocument(state);

    const expectedDocument = JSON.parse(`
{
  "body": [
    {
      "content": "\\n"
    },
    {
      "identifier": {
        "name": "document"
      },
      "arguments": [],
      "properties": [],
      "blocks": [
        {
          "children": [
            {
              "content": "paper-a4"
            }
          ]
        }
      ]
    },
    {
      "content": "\\n\\n"
    },
    {
      "identifier": {
        "name": "package"
      },
      "arguments": [],
      "properties": [],
      "blocks": [
        {
          "children": [
            {
              "content": "std::*"
            }
          ]
        }
      ]
    },
    {
      "content": "\\n\\n"
    },
    {
      "identifier": {
        "name": "chapter"
      },
      "arguments": [],
      "properties": [],
      "blocks": [
        {
          "children": [
            {
              "content": "Introduction"
            }
          ]
        }
      ]
    },
    {
      "content": "\\n\\nThis is an introduction text.\\n\\n"
    },
    {
      "identifier": {
        "name": "list::*"
      },
      "arguments": [],
      "properties": [],
      "blocks": [
        {
          "children": [
            {
              "content": "\\n  "
            },
            {
              "identifier": {
                "name": "item"
              },
              "arguments": [],
              "properties": [],
              "blocks": [
                {
                  "children": [
                    {
                      "content": "Item 1"
                    }
                  ]
                }
              ]
            },
            {
              "identifier": {
                "name": "item"
              },
              "arguments": [],
              "properties": [],
              "blocks": [
                {
                  "children": [
                    {
                      "content": "Item 2"
                    }
                  ]
                }
              ]
            },
            {
              "identifier": {
                "name": "item"
              },
              "arguments": [],
              "properties": [],
              "blocks": [
                {
                  "children": [
                    {
                      "content": "Item 3"
                    }
                  ]
                }
              ]
            },
            {
              "content": ""
            }
          ]
        }
      ]
    },
    {
      "content": "\\n"
    }
  ]
}`);

    expect(document).toEqual(expectedDocument);
  });
});
