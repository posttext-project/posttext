/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { HelperList } from './helperList'

export interface Node {
  renderToString(): Promise<string>
}

export interface Block {
  renderToString(): Promise<string>
  query(key: string | symbol): Promise<any[]>
  nodes: Node[]
}

export interface Document {
  query(key: string | symbol): Promise<any[]>
}

export interface BlockList {
  get(index: number): Block
  length: number
}

export interface TagResolverContext {
  helpers: HelperList
  attributes: Record<string, string>
  arguments: string[]
  blocks: BlockList
  document: Document
  state: Record<string | symbol, any>
}

export type TagResolver = (
  context: TagResolverContext
) => Promise<string>

export interface DataResolverContext {
  helpers: HelperList
  attributes: Record<string, string>
  arguments: string[]
  blocks: BlockList
  document: Document
  state: Record<string | symbol, any>
}

export type DataResolver = (context: DataResolverContext) => any

export interface TagDefinition {
  data?: Record<string | symbol, DataResolver>
  tag: TagResolver
}
