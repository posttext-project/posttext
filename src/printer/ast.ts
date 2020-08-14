export type Command = {
  [key: string]: any
} & {
  name: string
}

export interface TagNode {
  name: string
  attrs: Map<string, string>
  params: string[]
  commands: Command[]
  blocks: BlockNode[]
}

export interface TextNode {
  value: string
}

export interface BlockNode {
  childNodes: (TextNode | TagNode)[]
}

export interface RootNode {
  childNodes: (TextNode | TagNode)[]
}

export type PrinterNode =
  | RootNode
  | TextNode
  | BlockNode
  | TagNode
