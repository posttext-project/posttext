import fs from 'fs-extra'

import { DocumentNode, TagNode, TextNode, Node } from '../ast'

export interface GeneratorInput {
  ast: DocumentNode
  input: string
}

export interface GeneratorOptions {
  output: {
    file: string
  }
}

export class Generator {
  generate(
    { ast, input }: GeneratorInput,
    options: GeneratorOptions
  ) {
    const outputHtml = this.generateHtml(ast)

    fs.outputFile(options.output.file, outputHtml)
  }

  generateHtml(node: DocumentNode): string {
    return (
      node.body
        .map(node => this.generateRootNode(node))
        .join('') + '\n'
    )
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
      case 'title':
        return this.generateTitle(node)

      case 'bold':
        return this.generateBold(node)

      case 'italic':
        return this.generateItalic(node)
    }

    return ''
  }

  generateText(node: TextNode): string {
    return this.textContent(node)
  }

  generateTitle(node: Node): string {
    return '<h1>' + this.textContent(node) + '</h1>'
  }

  generateBold(node: Node): string {
    return '<b>' + this.textContent(node) + '</b>'
  }

  generateItalic(node: Node): string {
    return '<i>' + this.textContent(node) + '</i>'
  }

  generateParagraph(node: Node): string {
    if (this.textContent(node).match(/[^ \t\r\n]+/)) {
      return '<p>' + this.textContent(node) + '</p>'
    }

    return ''
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
