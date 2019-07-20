import { createTagNode } from '../fmt/builder'

export function createHtmlElement(
  elementName: string,
  attrs: AttributeNode[],
  body: BlockNode
) {
  return createTagNode(
    'html-element',
    [createTextNode(elementName)],
    attrs,
    [body]
  )
}
