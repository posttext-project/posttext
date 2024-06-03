import * as ast from './parser/ast'

export type Element = Text | Tag
export type ElementType = 'Text' | 'Tag'

export class Text {
  constructor(private node: ast.Text) {}

  get type(): ElementType {
    return this.node.type
  }

  text(): string {
    return this.node.value
  }
}

export class Block {
  private _elements: Element[] = []

  constructor(node: ast.Block) {
    this._elements = node.body.map((node) => {
      if (node.type === 'Tag') {
        return new Tag(node)
      }

      return new Text(node)
    })
  }

  get(index: number): Element {
    return this._elements[index]
  }

  get length(): number {
    return this._elements.length
  }

  map<T>(fn: (element: Element) => T): T[] {
    return this._elements.map(fn)
  }

  [Symbol.iterator](): Iterator<Element> {
    let index = 0

    return {
      next: (): IteratorResult<Element> => {
        if (index < this._elements.length) {
          return {
            value: this._elements[index++],
            done: false,
          }
        }

        return { done: true, value: null }
      },
    }
  }
}

export class BlockList {
  private _blocks: Block[] = []

  constructor(blocks: ast.Block[]) {
    this._blocks = blocks.map((block) => new Block(block))
  }

  get(i: number): Block {
    return this._blocks[i]
  }

  get length(): number {
    return this._blocks.length
  }

  map<T>(fn: (block: Block) => T): T[] {
    return this._blocks.map(fn)
  }

  [Symbol.iterator](): Iterator<Block> {
    let index = 0

    return {
      next: (): IteratorResult<Block> => {
        if (index < this._blocks.length) {
          return {
            value: this._blocks[index++],
            done: false,
          }
        }

        return { done: true, value: null }
      },
    }
  }
}

export class Tag {
  private _attributes: Record<string, string> = {}
  private _arguments: string[] = []

  private _blocks: BlockList = new BlockList([])

  constructor(private node: ast.Tag) {
    this._attributes = node.attributes.reduce(
      (acc, attribute) => {
        acc[attribute.identifier.name] = attribute.value.value

        return acc
      },
      {}
    )
    this._arguments = node.arguments.map(
      (argument) => argument.value.value
    )

    this._blocks = new BlockList(node.blocks)
  }

  get type(): ElementType {
    return this.node.type
  }

  get arguments(): string[] {
    return [...this._arguments]
  }

  get attributes(): Record<string, string> {
    return { ...this._attributes }
  }

  get blocks(): BlockList {
    return this._blocks
  }
}
