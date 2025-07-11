import { createParserState, isEof, setPosition } from '../state';

describe('setPosition', () => {
  it('throws when position is negative', () => {
    const state = createParserState('abc');
    expect(() => setPosition(state, -1)).toThrow('Invalid position');
  });

  it('throws when position is greater than input length', () => {
    const state = createParserState('abc');
    expect(() => setPosition(state, 4)).toThrow('Invalid position');
  });

  it('moves position to the specified position', () => {
    const state = createParserState('abc');
    setPosition(state, 2);
    expect(state.position).toBe(2);
    expect(state.column).toBe(3);
    expect(state.line).toBe(1);
  });

  it('updates column and line when moving to a new line', () => {
    const state = createParserState('a\nbc\nd');
    setPosition(state, 5);
    expect(state.position).toBe(5);
    expect(state.column).toBe(1);
    expect(state.line).toBe(3);
  });
});

describe('isEof', () => {
  it('returns true when position is at the end of the input', () => {
    const state = createParserState('abc');
    setPosition(state, 3);
    expect(isEof(state)).toBe(true);
  });

  it('returns false when position is not at the end of the input', () => {
    const state = createParserState('abc');
    setPosition(state, 2);
    expect(isEof(state)).toBe(false);
  });
});
