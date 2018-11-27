import { Plugin } from './Plugin'

export interface CursorOptions {
  doc?: string
  pos?: number
  line?: number
  col?: number
}

export class Cursor extends Plugin {
  doc: string
  pos: number
  line: number
  col: number

  constructor(options: Cursor) {
    super(options)

    this.doc = options.doc
    this.pos = options.pos
    this.line = options.line
    this.col = options.col
  }

  findRegexp(regexp: RegExp) {}
}
