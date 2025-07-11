export interface ParserState {
  input: string;
  position: number;
  line: number;
  column: number;
}

export function createParserState(input: string): ParserState {
  return {
    input,
    position: 0,
    line: 1,
    column: 1,
  };
}

export function setPosition(state: ParserState, position: number): void {
  if (position < 0 || position > state.input.length) {
    throw new Error('Invalid position');
  }

  if (position < state.position) {
    throw new Error('Cannot move position backwards');
  }

  for (let i = state.position; i < position; i++) {
    const char = state.input[i];
    if (char === '\n') {
      state.line++;
      state.column = 1;
    } else {
      state.column++;
    }
  }

  state.position = position;
}

export function isEof(state: ParserState): boolean {
  return state.position >= state.input.length;
}
