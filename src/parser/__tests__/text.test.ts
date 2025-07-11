import { createParserState, setPosition } from '../state';
import { parseText } from '../text';

describe('parseText', () => {
  it('should parse a simple string', () => {
    const state = createParserState('Hello World!');
    const text = parseText(state);
    expect(text.content).toBe('Hello World!');
  });

  it('should parse a string with a newline', () => {
    const state = createParserState('Hello\nWorld!');
    const text = parseText(state);
    expect(text.content).toBe('Hello\nWorld!');
  });

  it('should parse a string with a backslash', () => {
    const state = createParserState('Hello\\nWorld!');
    const text = parseText(state);
    expect(text.content).toBe('Hello');
  });

  it('should parse a string with a backslash at the end', () => {
    const state = createParserState('Hello\\');
    const text = parseText(state);
    expect(text.content).toBe('Hello');
  });

  it('should parse a string inside a block', () => {
    const state = createParserState('{Hello World!}');
    setPosition(state, 1);
    const text = parseText(state);
    expect(text.content).toBe('Hello World!');
  });

  it('should parse a string inside a block with a newline', () => {
    const state = createParserState('{Hello\nWorld!}');
    setPosition(state, 1);
    const text = parseText(state);
    expect(text.content).toBe('Hello\nWorld!');
  });

  it('should parse a string inside a block with a backslash', () => {
    const state = createParserState('{Hello\\nWorld!}');
    setPosition(state, 1);
    const text = parseText(state);
    expect(text.content).toBe('Hello');
  });
});
