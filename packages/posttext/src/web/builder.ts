import { Renderer, createRenderer } from './renderer'
import fs from 'fs-extra'
import { Parser, createParser } from '../parser'

interface Web {
  build(): Promise<void>
}

type BuilderFactory = () => Web

function createBuilderFactory(): BuilderFactory {
  return createBuilder
}

function createBuilder(): Web {
  const parser = createParser()
  const renderer = createRenderer()

  return {
    build: (): Promise<void> => build(parser, renderer),
  }
}

const DEFAULT_INPUT_FILE = './docs/index.pt'

async function build(
  parser: Parser,
  renderer: Renderer
): Promise<void> {
  const input = await fs.readFile(DEFAULT_INPUT_FILE, 'utf-8')

  const ast = parser.parse(input)
  const { html } = await renderer.render(ast)

  await fs.writeFile('index.html', html)
}

export default {
  name: 'web',
  factory: createBuilderFactory(),
}
