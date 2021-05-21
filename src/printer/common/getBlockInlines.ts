import { Data } from '../data'

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
