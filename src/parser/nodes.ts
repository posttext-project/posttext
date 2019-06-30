export interface DocumentNode {
  type: 'Document'
  body: DocumentChildNode[]
}

export type DocumentChildNode = TextNode | MacroNode

export interface IdentifierNode {
  type: 'Identifier'
  name: string
}

export interface TextNode {
  type: 'TextNode'
  value: string
}

export interface MacroNode {
  type: 'Macro'
  id: IdentifierNode
  params: TextNode[]
  attrs: MacroAttributeNode[]
  body: BlockNode[]
}

export interface MacroAttributeNode {
  type: 'MacroAttribute'
  id: IdentifierNode
  value: TextNode
}

export interface BlockNode {
  type: 'Block'
  verbatim: boolean
  body: BlockChildNode[]
}

export type BlockChildNode = TextNode | MacroNode

export type Node =
  | IdentifierNode
  | TextNode
  | MacroNode
  | MacroAttributeNode
  | BlockNode
