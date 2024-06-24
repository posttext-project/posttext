/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { HelperList } from './helperList'
import * as ast from './parser/ast'
import { Scope } from './scope'
import {
  Block,
  BlockList,
  DataResolverContext,
  Document,
  TagResolverContext,
} from './tag'

export interface Renderer {
  renderToString(ast: ast.Node): Promise<string>
}

export interface RendererOptions {
  scope: Scope
  helpers: HelperList
}

export function createRenderer({
  scope,
  helpers,
}: RendererOptions): Renderer {
  return {
    renderToString: (
      documentNode: ast.Document
    ): Promise<string> => {
      return renderToString(
        scope,
        helpers,
        documentNode,
        documentNode
      )
    },
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

function buildArguments(node: ast.Tag): string[] {
  return node.arguments.map((argument) => argument.value.value)
}

function buildAttributes(
  node: ast.Tag
): Record<string, string> {
  return node.attributes.reduce(
    (accu, attribute) => ({
      ...accu,
      [attribute.identifier.name]: attribute.value.value,
    }),
    {}
  )
}

async function query(
  scope: Scope,
  helpers: HelperList,
  documentNode: ast.Document,
  node: ast.Block | ast.Document,
  key: string | symbol
): Promise<any[]> {
  const items: any[] = []
  for (const childNode of node.body) {
    if (
      childNode.type === 'Tag' &&
      scope.hasTagResolver(childNode.identifier.name)
    ) {
      const tagDefinition = scope.getTagDefinition(
        childNode.identifier.name
      )
      const context: DataResolverContext =
        buildTagResolverContext(
          scope,
          helpers,
          documentNode,
          childNode
        )

      if (tagDefinition?.data?.[key]) {
        const item = await tagDefinition?.data?.[key]?.(context)
        items.push(item)
      }
    }
  }
  return items
}

function buildDocument(
  scope: Scope,
  helpers: HelperList,
  documentNode: ast.Document
): Document {
  return {
    query: async (key: string | symbol): Promise<any[]> =>
      query(scope, helpers, documentNode, documentNode, key),
  }
}

function buildBlock(
  scope: Scope,
  helpers: HelperList,
  documentNode: ast.Document,
  node: ast.Block
): Block {
  return {
    renderToString: async (): Promise<string> =>
      renderToString(scope, helpers, documentNode, node),

    query: async (key: string | symbol): Promise<any[]> =>
      query(scope, helpers, documentNode, node, key),

    nodes: node.body.map((childNode) => ({
      renderToString: (): Promise<string> =>
        renderToString(scope, helpers, documentNode, childNode),
    })),
  }
}

function buildBlockList(
  scope: Scope,
  helpers: HelperList,
  document,
  node: ast.Tag
): BlockList {
  return {
    get(index: number): Block {
      return buildBlock(
        scope,
        helpers,
        document,
        node.blocks[index]
      )
    },

    get length(): number {
      return node.blocks.length
    },
  }
}

function buildTagResolverContext(
  scope: Scope,
  helpers: HelperList,
  documentNode: ast.Document,
  node: ast.Tag
): TagResolverContext {
  return {
    helpers,
    arguments: buildArguments(node),
    attributes: buildAttributes(node),
    blocks: buildBlockList(scope, helpers, documentNode, node),
    get document(): Document {
      return buildDocument(scope, helpers, documentNode)
    },
    state: {},
  }
}

async function renderToString(
  scope: Scope,
  helpers: HelperList,
  documentNode: ast.Document,
  ast: ast.Node
): Promise<string> {
  switch (ast.type) {
    case 'Document': {
      return HTML_TEMPLATE
    }
    case 'Block': {
      const chunks: string[] = []

      for (const node of ast.body) {
        chunks.push(
          await renderToString(
            scope,
            helpers,
            documentNode,
            node
          )
        )
      }

      return chunks.join('')
    }
    case 'Tag': {
      if (!scope.hasTagResolver(ast.identifier.name)) {
        throw new Error(
          `Invalid tag name: ${ast.identifier.name}`
        )
      }

      const tagDefinition = scope.getTagDefinition(
        ast.identifier.name
      )
      const context = buildTagResolverContext(
        scope,
        helpers,
        documentNode,
        ast
      )

      return tagDefinition.tag(context)
    }
    case 'Text': {
      return ast.value
    }
    default: {
      throw new Error(`Unknown node type: ${ast.type}`)
    }
  }
}
