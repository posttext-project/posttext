import { ParserState, setPosition } from './state';

export function skipWhitespace(state: ParserState): void {
  let position: number;
  for (position = state.position; position < state.input.length; position++) {
    const char = state.input[position];
    if (char.trim() !== '') {
      break;
    }
  }

  setPosition(state, position);
}
