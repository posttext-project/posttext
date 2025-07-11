import { createParserState } from '../state';
import { skipWhitespace } from '../util';

describe('skipWhitespace', () => {
  it('skips whitespaces', () => {
    const state = createParserState(' abc');
    skipWhitespace(state);
    expect(state.position).toBe(1);
  });

  it('skips whitespaces and newlines', () => {
    const state = createParserState('\n abc');
    skipWhitespace(state);
    expect(state.position).toBe(2);
  });

  it('skips whitespaces, newlines and tabs', () => {
    const state = createParserState('\n\t\t abc');
    skipWhitespace(state);
    expect(state.position).toBe(4);
  });
});
