import { Document } from './ast';
import { isEof, ParserState } from './state';
import { parseTag, isTagStart } from './tag';
import { parseText } from './text';

export function parseDocument(state: ParserState): Document {
  const document: Document = {
    body: [],
  };

  while (!isEof(state)) {
    if (isTagStart(state)) {
      document.body.push(parseTag(state));
    } else {
      document.body.push(parseText(state));
    }
  }

  return document;
}
