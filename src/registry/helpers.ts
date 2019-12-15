import { TagNode, TextNode } from '../parser'

export function isMacroNode(node: TagNode | TextNode): boolean {
  return node.type === 'Tag' && node.name.endsWith('!')
}

export function isTagNode(node: TagNode | TextNode): boolean {
  return node.type === 'Tag' && !node.name.endsWith('!')
}

export function isTextNode(node: TagNode | TextNode): boolean {
  return node.type === 'Text'
}
