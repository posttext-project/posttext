import { Command } from '../printer'

export const extractParagraphs = {
  text: async function* (
    textContent: string
  ): AsyncGenerator<Command, void, any> {
    const paragraphs = textContent
      .split(/(?:\n\r?[ ]?)+/)
      .filter((chunk) => !/^\s+$/.test(chunk))

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
