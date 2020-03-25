export interface BaseNode {
  type: string
}

export interface DocumentNode extends BaseNode {
  type: 'Document'
  body: (TagNode | TextNode)[]
}

export interface TagNode extends BaseNode {
  type: 'Tag'
  id: IdentifierNode
  params: ParameterNode[]
  blocks: BlockNode[]
  attrs: AttributeNode[]
}

export interface IdentifierNode extends BaseNode {
  type: 'Identifier'
  name: string
}

export interface ParameterNode extends BaseNode {
  type: 'Parameter'
  value: string
}

export interface AttributeNode extends BaseNode {
  type: 'Attribute'
  id: IdentifierNode
  value: string
}

export interface TextNode extends BaseNode {
  type: 'Text'
  value: string
}

export interface BlockNode extends BaseNode {
  type: 'Block'
  body: (TagNode | TextNode)[]
}

export type Node =
  | DocumentNode
  | TagNode
  | TextNode
  | BlockNode
  | ParameterNode
  | AttributeNode
  | IdentifierNode
