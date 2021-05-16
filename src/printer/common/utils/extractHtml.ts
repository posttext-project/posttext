import { Data } from '../../data'

export async function* extractHtml(
  generator: AsyncGenerator<Data, any, any>
): AsyncGenerator<Data, any, any> {
  const chunks: string[] = []

  for await (const data of generator) {
    if (data.name === 'html') {
      chunks.push(data.content)
    } else {
      yield data
    }
  }

  return chunks.join('')
}

export async function* joinInterpreterResults(
  generators: AsyncGenerator<Data, any, any>[]
): AsyncGenerator<Data, any, any> {
  const chunks: string[] = []

  for (const generator of generators) {
    const content = yield* generator

    chunks.push(content)
  }

  return chunks.join('')
}
