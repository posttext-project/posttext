import { Plugin } from './Plugin'

export interface CursorOptions {
  doc: string
  pos?: number
  line?: number
  col?: number
}

export interface CursorOptions {
  doc: string
  pos?: number
  line?: number
  col?: number
}

export class Cursor extends Plugin {
  doc: string
  pos: number
  line: number
  col: number

  constructor(options: CursorOptions) {
    super(options)

    this.doc = options.doc
    this.pos = options.pos || 0
    this.line = options.line || 1
    this.col = options.col || 1
  }

  findRegexp(regexp: RegExp) {}
}
