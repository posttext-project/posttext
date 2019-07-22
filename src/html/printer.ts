import { Registry, Scope } from '../registry'
import { DocumentNode, Node } from '../parser'

export interface PrintOptions {
  indent?: number
}

export class Printer {
  initialScope: Scope = new Scope()

  setScope(scope: Scope) {
    this.initialScope = scope
  }

  getScope(): Scope {
    return this.initialScope
  }

  setRegistry(registry: Registry) {
    this.initialScope.setRegistry(registry)
  }

  getRegistry(): Registry {
    return this.initialScope.getRegistry()
  }

  print(ast: DocumentNode, options: PrintOptions = {}): string {
    const docNode = <DocumentNode>ast

    const htmlAst: DocumentNode = {
      type: 'Document',
      body: this.initialScope.resolve(docNode.body, options)
    }

    return this.render(htmlAst)
  }

  render(ast: Node): string {
    switch (ast.type) {
      case 'Document': {
        return ast.body.map(node => this.render(node)).join('')
      }

      case 'Block': {
        return ast.body.map(node => this.render(node)).join('')
      }

      case 'Tag': {
        if (ast.id.name === 'html-element') {
          const htmlTagName = ast.params[0].value || 'div'

          const openTag = '<' + htmlTagName + '>'

          const content =
            ast.body && ast.body[0]
              ? this.render(ast.body[0])
              : ''

          const closeTag = '</' + htmlTagName + '>'

          return openTag + content + closeTag
        }

        return ''
      }

      case 'Text': {
        return ast.value
      }
    }

    return ''
  }
}
