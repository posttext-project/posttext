import { AttributeNode, TagNode, TextNode } from '../parser'
import {
  createTagNode,
  createTextNode,
  createBlock
} from '../fmt/builder'

export function createHtmlElement(
  elementName: string,
  attrs: AttributeNode[],
  body: (TagNode | TextNode)[]
) {
  return createTagNode(
    'html-element',
    [createTextNode(elementName)],
    attrs,
    [createBlock(body)]
  )
}
