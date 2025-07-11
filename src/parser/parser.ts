import { Document } from './ast';
import { parseDocument } from './document';
import { createParserState, ParserState } from './state';

export interface Parser {
  parse(input: string): Document;
}

export function createParser(): Parser {
  return {
    parse: (input: string) => parse(input),
  };
}

export function parse(input: string): Document {
  const state: ParserState = createParserState(input);

  return parseDocument(state);
}
