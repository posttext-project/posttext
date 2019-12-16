export interface BaseNode {
  type: string
}

export interface DocumentNode extends BaseNode {
  type: 'Document'
  body: Node[]
}

export interface TagNode extends BaseNode {
  type: 'Tag'
  id: IdentifierNode
  children: Node[]
}

export interface IdentifierNode extends BaseNode {
  type: 'Identifier'
  name: string
}

export interface TextNode extends BaseNode {
  type: 'Text'
  value: string
}

export type Node = DocumentNode | TagNode | TextNode
