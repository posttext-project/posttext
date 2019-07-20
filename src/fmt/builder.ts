import {
  TagNode,
  TextNode,
  BlockNode,
  BlockChildNode,
  AttributeNode
} from '../parser'

export function createTagNode(
  tagName: string,
  params: TextNode[] = [],
  attrs: AttributeNode[] = [],
  blocks: BlockNode[] = []
): TagNode {
  return {
    type: 'Tag',
    id: {
      type: 'Identifier',
      name: tagName
    },
    params,
    attrs,
    body: blocks
  }
}

export function createTextNode(value: string): TextNode {
  return {
    type: 'Text',
    value
  }
}

export function createBlock(
  childNodes: BlockChildNode[],
  verbatim: boolean = false
): BlockNode {
  return {
    type: 'Block',
    verbatim,
    body: childNodes
  }
}

export function createAttribute(
  name: string,
  value: string
): AttributeNode {
  return {
    type: 'Attribute',
    id: {
      type: 'Identifier',
      name
    },
    value: {
      type: 'Text',
      value
    }
  }
}

export function nodesToString(
  nodes: (TextNode | TagNode)[]
): string {
  let chunks: string[] = []

  for (const node of nodes) {
    switch (node.type) {
      case 'Tag': {
        for (const childBlock of (<TagNode>node).body) {
          chunks.push(nodesToString(childBlock.body))
        }
      }

      case 'Text': {
        chunks.push((<TextNode>node).value)
      }
    }
  }

  return chunks.join('')
}
