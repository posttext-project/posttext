import * as ast from '../ast'

export interface DocumentNode extends ast.DocumentNode {
  __metadata: Record<string, any>
  body: (TagNode | TextNode)[]
}

export interface BlockNode extends ast.BlockNode {
  body: (TagNode | TextNode)[]
}

export interface TagNode extends ast.TagNode {
  __metadata: Record<string, any>
  blocks: BlockNode[]
}

export type TextNode = ast.TextNode

export type AttributeNode = ast.AttributeNode

export type ParameterNode = ast.ParameterNode

export type IdentifierNode = ast.IdentifierNode

export type Node =
  | DocumentNode
  | TagNode
  | TextNode
  | BlockNode
  | ParameterNode
  | AttributeNode
  | IdentifierNode
