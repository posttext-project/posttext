/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import * as ast from '@posttext/parser/ast'

export interface DocumentNode extends ast.DocumentNode {
  __metadata: Record<string, any>
  body: (TagNode | TextNode)[]
}

export interface BlockNode extends ast.BlockNode {
  body: (TagNode | TextNode)[]
}

export interface TagNode extends ast.TagNode {
  __metadata: Record<string | symbol, any>
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
