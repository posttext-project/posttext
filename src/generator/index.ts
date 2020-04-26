import { DocumentNode, TagNode, TextNode } from '../ast'
import { Module } from './module'
import { Resolver } from './resolver'
import { Command } from '../printer'

export type GeneratorInput = {
  ast: DocumentNode
  target: string
}

export type TagGeneratorInput = {
  tagNode: TagNode
  target: string
}

export type TextGeneratorInput = {
  textNode: TextNode
  target: string
}

export interface GeneratorStruct {
  resolvers: Map<string, Resolver>
}

export class Generator {
  private resolvers: Map<string, Resolver>

  static new(): Generator {
    return new Generator()
  }

  constructor({ resolvers }: Partial<GeneratorStruct> = {}) {
    this.resolvers = resolvers ?? new Map()
  }

  registerRootModule(module: Module): void {
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
          {{{ content }}}
        `,
        data: {
          name: 'compose',
          reduce: [
            {
              name: 'getBlock',
              offset: 0,
              transform: (
                content: string
              ): Record<string, any> => ({ content }),
            },
          ],
        },
      },
      children: [
        ast.body
          .map((node) =>
            node.type === 'Tag'
              ? this.generateTag({ tagNode: node, ...input })
              : node.type === 'Text'
              ? this.generateText({
                  textNode: node,
                  ...input,
                })
              : []
          )
          .reduce(
            (accum, subcommands) => [...accum, ...subcommands],
            []
          ),
      ],
    }
  }

  generateTag({
    tagNode,
    ...input
  }: TagGeneratorInput): Command[] {
    return [
      {
        name: 'tree',
        data: {
          attrs: tagNode.attrs.reduce(
            (target, attr) => ({
              [attr.id.name]: attr.value,
            }),
            {}
          ),
          params: tagNode.params.map((param) => param.value),
        },
        current:
          this.resolvers.get(tagNode.id.name)?.resolve(input) ??
          undefined,
        children: tagNode.blocks.map((blockNode) =>
          blockNode.body
            .map((node) =>
              node.type === 'Text'
                ? this.generateText({
                    textNode: node,
                    ...input,
                  })
                : node.type === 'Tag'
                ? this.generateTag({
                    tagNode: node,
                    ...input,
                  })
                : []
            )
            .reduce(
              (accum, subcommands) => [
                ...accum,
                ...subcommands,
              ],
              []
            )
        ),
      },
    ]
  }

  generateText({ textNode }: TextGeneratorInput): Command[] {
    return [
      {
        name: 'text',
        content: textNode.value,
      },
    ]
  }
}

export class DefaultModule implements Module {
  registerTagResolvers(): Record<string, Resolver> {
    return {}
  }
}
