import {
  TagNode,
  TextNode,
  BlockNode,
  BlockChildNode,
  AttributeNode,
  DocumentNode
} from '../parser'

export function createDocumentNode(
  body: BlockChildNode[]
): DocumentNode {
  return {
    type: 'Document',
    body
  }
}

export function createTagNode(
  tagName: string,
  params: string[] = [],
  attrs: AttributeNode[] = [],
  blocks: BlockNode[] = []
): TagNode {
  return {
    type: 'Tag',
    name: tagName,
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
    verbatim,
    body: childNodes
  }
}

export function createAttribute(
  name: string,
  value: string
): AttributeNode {
  return {
    name,
    value
  }
}

export function traverse(
  node: BlockChildNode,
  visit: (tagNode: TagNode) => TagNode
): BlockChildNode {
  switch (node.type) {
    case 'Tag': {
      const visitedTag = visit(node)

      return createTagNode(
        visitedTag.name,
        visitedTag.params,
        visitedTag.attrs,
        visitedTag.body.map(block => {
          return createBlock(
            block.body.map(childNode => {
              return traverse(childNode, visit)
            }, block.verbatim)
          )
        })
      )
    }

    case 'Text': {
      return node
    }
  }

  return node
}

export function mapAll<T>(
  node: BlockChildNode,
  transform: (tagNode: TagNode) => IterableIterator<T>
): T[] {
  switch (node.type) {
    case 'Tag': {
      return Array.from(transform(node)).concat(
        node.body
          .map(block =>
            block.body
              .map(childNode => mapAll(childNode, transform))
              .reduce((prev, next) => prev.concat(next), [])
          )
          .reduce((prev, next) => prev.concat(next), [])
      )
    }

    case 'Text': {
      return []
    }
  }

  return []
}
