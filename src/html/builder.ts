import { AttributeNode, BlockChildNode } from '../parser'
import {
  createTagNode,
  createBlock
} from '../builder'

export function createHtmlElement(
  elementName: string,
  attrs: AttributeNode[],
  body: BlockChildNode[]
) {
  return createTagNode(
    'html-element',
    [elementName],
    attrs,
    [createBlock(body)]
  )
}
