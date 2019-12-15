import { Registry, Scope } from '../registry'
import { PTDocument, Node } from '../parser'

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

  print(ast: PTDocument, options: PrintOptions = {}): string {
    const docNode = <PTDocument>ast

    const htmlAst: PTDocument = {
      type: 'Document',
      body: this.initialScope.resolveBlockChildNodes(
        docNode.body,
        options
      )
    }

    return this.printAst(htmlAst)
  }

  printAst(ast: Node): string {
    switch (ast.type) {
      case 'Document': {
        return ast.body
          .map(node => this.printAst(node))
          .join('')
      }

      case 'Tag': {
        if (ast.name === 'html-element') {
          const htmlTagName = ast.params[0] || 'div'

          const openTag = '<' + htmlTagName + '>'

          const content =
            ast.body && ast.body[0]
              ? ast.body[0].body
                  .map(node => this.printAst(node))
                  .join('')
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
