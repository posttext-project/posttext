/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

export interface Document {
  type: 'Document'
  body: Element[]
}

export interface Tag {
  type: 'Tag'
  identifier: Identifier
  arguments: Argument[]
  blocks: Block[]
  attributes: Attribute[]
}

export interface Argument {
  type: 'Argument'
  value: Literal
}

export interface Literal {
  type: 'Literal'
  value: string
}

export interface Identifier {
  type: 'Identifier'
  name: string
}

export interface Attribute {
  type: 'Attribute'
  identifier: Identifier
  value: Literal
}

export interface Text {
  type: 'Text'
  value: string
}

export interface Block {
  type: 'Block'
  body: Element[]
}

export type ElementType = 'Tag' | 'Text'
export type Element = Tag | Text

export type NodeType =
  | 'Document'
  | 'Tag'
  | 'Argument'
  | 'Literal'
  | 'Identifier'
  | 'Attribute'
  | 'Text'
  | 'Block'

export type Node =
  | Document
  | Tag
  | Text
  | Block
  | Argument
  | Attribute
  | Identifier
