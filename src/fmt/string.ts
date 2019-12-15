import { BlockChildNode, TagNode, TextNode } from '../parser'

export function nodesToString(nodes: BlockChildNode[]): string {
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
