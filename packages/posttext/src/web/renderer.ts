import { Node } from '../parser/ast'

export interface RenderResult {
  html: string
}

export interface Renderer {
  render(ast: Node): Promise<RenderResult>
}

export function createRenderer(): Renderer {
  return {
    render,
  }
}

const HTML_TEMPLATE = `<!DOCTYPE html>
<html>
<head>

</head>
<body>

</body>
</html>
`

async function render(ast: Node): Promise<RenderResult> {
  switch (ast.type) {
    case 'Document':
      return {
        html: HTML_TEMPLATE,
      }
    case 'Block':
      return {
        html: '',
      }
    case 'Tag':
      return {
        html: '',
      }
    case 'Text':
      return {
        html: '',
      }
    default:
      throw new Error(`Unknown node type: ${ast.type}`)
  }
}
