export interface BaseNode {
  type: string
}

export interface DocumentNode extends BaseNode {
  type: 'Document'
  body: ChildNode[]
}

export interface TextNode extends BaseNode {
  type: 'Text'
  value: string
}

export interface TagNode extends BaseNode {
  type: 'Tag'
  namespace?: string
  name: string
  params: string[]
  attrs: AttributeNode[]
  body: BlockNode[]
}

export interface AttributeNode extends BaseNode {
  type: 'Attribute'
  namespace?: string
  name: string
  value: string
}

export interface BlockNode extends BaseNode {
  type: 'Block'
  verbatim: boolean
  body: ChildNode[]
}

export interface IdentifierNode extends BaseNode {
  type: 'Identifier'
  name: string
  namespace?: string
}

export type ChildNode =
  | TagNode
  | TextNode

export type Node =
  | BaseNode
  | DocumentNode
  | TagNode
  | AttributeNode
  | BlockNode
  | TextNode
  | IdentifierNode
