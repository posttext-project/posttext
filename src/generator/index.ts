import { DocumentNode, TagNode, TextNode, Node } from '../ast'

export interface GeneratorInput {
  ast: DocumentNode
  input: string
}

export class Generator {
  static new() {
    return new Generator()
  }

  generate({ ast }: GeneratorInput) {
    return this.generateHtml(ast)
  }

  generateHtml(node: Node): string {
    switch (node.type) {
      case 'Document':
        return (
          node.body
            .map(node => this.generateRootNode(node))
            .join('') + '\n'
        )

      case 'Tag':
        return this.generateTag(node)

      case 'Text':
        return this.generateText(node)
    }

    throw new Error('Unsupported node type')
  }

  generateRootNode(node: Node): string {
    switch (node.type) {
      case 'Text':
        return this.generateParagraph(node)

      case 'Tag':
        return this.generateTag(node)
    }

    return ''
  }

  generateTag(node: TagNode): string {
    switch (node.id.name.toLocaleLowerCase()) {
      case 'section':
        return this.generateSection(node)

      case 'title':
        return this.generateTitle(node)

      case 'bold':
        return this.generateBold(node)

      case 'italic':
        return this.generateItalic(node)

      case 'paragraph':
        return this.generateParagraph(node)
    }

    return ''
  }

  isInlineNode(node: Node): boolean {
    if (node.type === 'Tag') {
      return (
        ['title', 'bold', 'italic', 'paragraph'].findIndex(
          name => node.id.name === name
        ) !== -1
      )
    }

    return false
  }

  generateSection(node: Node): string {
    return '<section>' + this.htmlContent(node) + '</section>'
  }

  generateText(node: Node): string {
    return this.textContent(node)
  }

  generateTitle(node: Node): string {
    return '<h1>' + this.inlineContent(node) + '</h1>'
  }

  generateBold(node: Node): string {
    return '<b>' + this.inlineContent(node) + '</b>'
  }

  generateItalic(node: Node): string {
    return '<i>' + this.inlineContent(node) + '</i>'
  }

  generateParagraph(node: Node): string {
    if (this.textContent(node).match(/[^ \t\r\n]+/)) {
      return '<p>' + this.inlineContent(node) + '</p>'
    }

    return ''
  }

  htmlContent(node: Node): string {
    switch (node.type) {
      case 'Document':
        return node.body
          .map(node => this.inlineContent(node))
          .join('')

      case 'Tag':
        return node.children
          .map(node => this.generateHtml(node))
          .join('')

      case 'Text':
        return node.value
    }

    throw new Error('Unsupported node type')
  }

  inlineContent(node: Node): string {
    switch (node.type) {
      case 'Document':
        return node.body
          .map(node => this.inlineContent(node))
          .join('')

      case 'Tag':
        return node.children
          .map(node => {
            if (this.isInlineNode(node)) {
              return this.generateTag(<TagNode>node)
            }

            return this.textContent(node)
          })
          .join('')

      case 'Text':
        return node.value
    }

    throw new Error('Unsupported node type')
  }

  textContent(node: Node): string {
    switch (node.type) {
      case 'Document':
        return node.body
          .map(node => this.textContent(node))
          .join('')

      case 'Tag':
        return node.children
          .map(node => this.textContent(node))
          .join('')

      case 'Text':
        return node.value
    }

    throw new Error('Unsupported node type')
  }
}
