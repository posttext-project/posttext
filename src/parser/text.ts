import { Text } from './ast';
import { ParserState, setPosition } from './state';

export function parseText(state: ParserState): Text {
  let position: number;
  for (position = state.position; position < state.input.length; position++) {
    const char = state.input[position];
    if (char === '\\' || char === '}') {
      break;
    }
  }

  const text: Text = {
    content: state.input.slice(state.position, position),
  };

  setPosition(state, position);

  return text;
}
