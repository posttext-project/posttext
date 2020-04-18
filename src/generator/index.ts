import {
  DocumentNode,
  TagNode,
  TextNode,
  BlockNode
} from '../ast'
import { Module } from './module'
import { Resolver } from './resolver'
import { Command } from '../printer'

export type GeneratorInput<T = { ast: DocumentNode }> = {
  target: string
} & T

export interface GeneratorStruct {
  resolvers: Map<string, Resolver>
}

export class Generator {
  private resolvers: Map<string, Resolver>

  static new() {
    return new Generator()
  }

  constructor({ resolvers }: Partial<GeneratorStruct> = {}) {
    this.resolvers = resolvers ?? new Map()
  }

  registerRootModule(module: Module) {
    const resolvers = new Map(
      Object.entries(module.registerTagResolvers())
    )

    this.resolvers = resolvers
  }

  generate({ ast, ...input }: GeneratorInput): Command {
    return {
      name: 'tree',
      data: {},
      current: {
        name: 'html',
        template: `
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <title>{{ title }}</title>
            </head>
            <body>
              {{ content }}
            </body>
          </html>
        `,
        data: {
          name: 'compose',
          reduce: [
            {
              name: 'getBlock',
              offset: 0,
              transform: (content: string) => ({ content })
            },
            {
              name: 'getTitle',
              transform: (title: string = 'Document') => ({
                title
              })
            }
          ]
        }
      },
      children: [
        ast.body.map(node =>
          node.type === 'Tag'
            ? this.generateTag({ tagNode: node, ...input })
            : this.generateText({
                textNode: node,
                ...input
              })
        )
      ]
    }
  }

  generateTag({
    tagNode,
    ...input
  }: GeneratorInput<{ tagNode: TagNode }>): Command {
    console.log(
      tagNode.id.name,
      this.resolvers.get(tagNode.id.name)
    )

    return {
      name: 'tree',
      data: {
        attrs: tagNode.attrs.reduce(
          (target, attr) => ({
            [attr.id.name]: attr.value
          }),
          {}
        ),
        params: tagNode.params.map(param => param.value)
      },
      current: this.resolvers
        .get(tagNode.id.name)
        ?.resolve(input) ?? {
        name: '#undefined'
      },
      children: tagNode.blocks.map(blockNode =>
        blockNode.body.map(node =>
          node.type === 'Text'
            ? this.generateText({
                textNode: node,
                ...input
              })
            : node.type === 'Tag'
            ? this.generateTag({
                tagNode: node,
                ...input
              })
            : {
                name: '#undefined'
              }
        )
      )
    }
  }

  generateText({
    textNode
  }: GeneratorInput<{
    textNode: TextNode
  }>): Command {
    return {
      name: 'text',
      textContent: textNode.value
    }
  }
}

export class DefaultModule implements Module {
  registerTagResolvers() {
    return {}
  }
}
