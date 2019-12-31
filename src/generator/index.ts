import Prism from 'prismjs'
import loadLanguages from 'prismjs/components/'

import { DocumentNode, TagNode, Node, TextNode } from '../ast'
import { supportedLanguages } from './prism'

export interface GeneratorInput {
  ast: DocumentNode
  input: string
}

export class Generator {
  static new() {
    loadLanguages(supportedLanguages)

    return new Generator()
  }

  generate({ ast }: GeneratorInput) {
    return this.generateNode(ast)
  }

  generateNode(node: Node): string {
    switch (node.type) {
      case 'Document':
        return this.generateDocument(node)

      case 'Tag':
        return this.generateTag(node)

      case 'Text':
        return this.generateText(node)

      case 'Block':
        return node.body
          .map(innerNode => this.htmlContent(innerNode))
          .join('')
    }

    throw new Error('Unsupported node type')
  }

  generateDocument(node: DocumentNode): string {
    return (
      node.body
        .map(innerNode => this.generateRootNode(innerNode))
        .join('') + '\n'
    )
  }

  generateRootNode(node: TextNode | TagNode): string {
    switch (node.type) {
      case 'Text':
        return '<p>' + node.value + '</p>'

      case 'Tag':
        return this.generateTag(node)
    }

    return ''
  }

  generateTag(node: TagNode): string {
    switch (
      node.id.name.toLocaleLowerCase().replace(/\-+/, '')
    ) {
      case 'section':
        return this.generateSectionTag(node)

      case 'title':
        return this.generateTitleTag(node)

      case 'bold':
        return this.generateBoldTag(node)

      case 'italic':
        return this.generateItalicTag(node)

      case 'underline':
        return this.generateUnderline(node)

      case 'paragraph':
        return this.generateParagraphTag(node)

      case 'list':
        return this.generateListTag(node)

      case 'item':
        return this.generateItemTag(node)

      case 'code':
        return this.generateCodeTag(node)
    }

    return ''
  }

  generateSectionTag(node: TagNode): string {
    return '<section>' + this.htmlContent(node) + '</section>'
  }

  generateText(node: TextNode): string {
    return this.textContent(node)
  }

  generateTitleTag(node: TagNode): string {
    return '<h1>' + this.htmlContent(node) + '</h1>'
  }

  generateBoldTag(node: TagNode): string {
    return '<b>' + this.htmlContent(node) + '</b>'
  }

  generateItalicTag(node: TagNode): string {
    return '<i>' + this.htmlContent(node) + '</i>'
  }

  generateUnderline(node: TagNode): string {
    return '<u>' + this.htmlContent(node) + '</u>'
  }

  generateParagraphTag(node: TagNode): string {
    return '<p>' + this.htmlContent(node) + '</p>'
  }

  generateListTag(node: TagNode): string {
    return '<ul>' + this.htmlContent(node) + '</ul>'
  }

  generateItemTag(node: TagNode): string {
    return '<li>' + this.htmlContent(node) + '</li>'
  }

  generateCodeTag(node: TagNode): string {
    const code =
      node.blocks.length > 0
        ? this.textContent(node.blocks[0])
        : ''

    const language =
      node.params.length > 0 &&
      supportedLanguages.indexOf(node.params[0].value) !== -1
        ? node.params[0].value
        : 'markdown'

    return `<pre class="language-${language}"><code class="language-${language}">${Prism.highlight(
      this.normalizeTextContent(code),
      Prism.languages[language],
      language
    )}</code></pre>`
  }

  htmlContent(node: Node): string {
    switch (node.type) {
      case 'Document':
        return node.body
          .map(innerNode => this.generateNode(innerNode))
          .join('')

      case 'Tag':
        return (node.blocks[0]?.body ?? [])
          .map(block => this.generateNode(block))
          .join('')

      case 'Text':
        return node.value

      case 'Block':
        return node.body
          .map(innerNode => this.generateNode(innerNode))
          .join('')
    }

    throw new Error('Unsupported node type')
  }

  normalizeTextContent(input: string): string {
    return this.normalizeIndents(
      this.trimFirstAndLastLines(input)
    )
  }

  trimFirstAndLastLines(input: string): string {
    return input
      .replace(/^[ \t]*\r?\n/, '')
      .replace(/\r?\n[ \t]*$/, '')
  }

  normalizeIndents(input: string): string {
    const doc = input.replace(/\t/g, '    ')

    const indents = doc
      .replace(/^\n|\n$/gm, '')
      .matchAll(/^[ ]*/gm)

    const indentSize = Array.from(indents)
      .map(chunk => chunk[0].length)
      .reduce((prev, next) => Math.min(prev, next))

    return indentSize > 0
      ? doc.replace(/^[ ]+/gm, indent =>
          indent.substring(indentSize)
        )
      : doc
  }

  textContent(node: Node): string {
    switch (node.type) {
      case 'Document':
        return node.body
          .map(innerNode => this.textContent(innerNode))
          .join('')

      case 'Tag':
        return ''

      case 'Text':
        return node.value

      case 'Block':
        return node.body
          .map(innerNode => this.textContent(innerNode))
          .join('')
    }

    throw new Error('Unsupported node type')
  }
}
