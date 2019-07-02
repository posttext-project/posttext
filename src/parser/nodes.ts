export interface DocumentNode {
  type: 'Document'
  body: DocumentChildNode[]
}

export type DocumentChildNode = TextNode | TagNode

export interface IdentifierNode {
  type: 'Identifier'
  name: string
}

export interface TextNode {
  type: 'Text'
  value: string
}

export interface TagNode {
  type: 'Tag'
  id: IdentifierNode
  params: TextNode[]
  attrs: AttributeNode[]
  body: BlockNode[]
}

export interface AttributeNode {
  type: 'Attribute'
  id: IdentifierNode
  value: TextNode
}

export interface BlockNode {
  type: 'Block'
  verbatim: boolean
  body: BlockChildNode[]
}

export type BlockChildNode = TextNode | TagNode

export type Node =
  | IdentifierNode
  | TextNode
  | TagNode
  | AttributeNode
  | BlockNode
