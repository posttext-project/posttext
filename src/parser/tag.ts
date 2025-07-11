import { Block, Identifier, Literal, Node, Property, Tag } from './ast';
import { skipWhitespace } from './util';
import { isEof, ParserState, setPosition } from './state';
import { parseText } from './text';

export function parseTag(state: ParserState): Tag {
  if (!isTagStart(state)) {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  skipWhitespace(state);

  const identifier = parseTagIdentifier(state);

  let args: Literal[] = [];
  if (isTagArguments(state)) {
    args = parseTagArguments(state);
  }

  skipWhitespace(state);

  let properties: Property[] = [];
  if (isTagProperties(state)) {
    properties = parseTagProperties(state);
  }

  skipWhitespace(state);

  let blocks: Block[] = [];
  if (isTagBlocks(state)) {
    blocks = parseTagBlocks(state);
  }

  const tag: Tag = {
    identifier,
    arguments: args,
    properties,
    blocks,
  };

  return tag;
}

export function isTagStart(state: ParserState): boolean {
  return state.input[state.position] === '\\';
}

export function parseTagIdentifier(state: ParserState): Identifier {
  let position: number;

  let expectLetter = true;
  let expectSeparator = false;
  let expectHyphen = false;
  let expectEndOfIdentifier = false;
  let expectAsterisk = false;

  let isFirstLetter = true;

  for (position = state.position; position < state.input.length; position++) {
    if (expectLetter && /[a-z]/.test(state.input[position])) {
      if (isFirstLetter) {
        isFirstLetter = false;
        expectLetter = true;
        expectSeparator = true;
        expectHyphen = true;
        expectEndOfIdentifier = true;
      } else {
        expectLetter = true;
        expectSeparator = true;
        expectHyphen = true;
        expectEndOfIdentifier = true;
      }
    } else if (expectSeparator && state.input[position] === ':') {
      if (state.input[position + 1] === ':') {
        position++;
      } else {
        throw new Error('Unexpected character');
      }

      expectLetter = true;
      expectAsterisk = true;
      expectSeparator = false;
      expectHyphen = false;
      expectEndOfIdentifier = false;
    } else if (expectHyphen && state.input[position] === '-') {
      expectLetter = true;
      expectSeparator = false;
      expectHyphen = false;
      expectEndOfIdentifier = false;
    } else if (expectAsterisk && state.input[position] === '*') {
      position++;

      break;
    } else if (
      expectEndOfIdentifier &&
      (state.input[position] === ' ' ||
        state.input[position] === '(' ||
        state.input[position] === '[' ||
        state.input[position] === '{')
    ) {
      break;
    } else {
      throw new Error('Unexpected character');
    }
  }

  const tagName = state.input.substring(state.position, position);

  setPosition(state, position);

  const identifier: Identifier = {
    name: tagName,
  };

  return identifier;
}

export function parseProperty(state: ParserState): Property {
  // TODO: Implement property parsing
  return {
    identifier: parseTagIdentifier(state),
    value: parserPropertyValue(state),
  };
}

export function parserPropertyValue(state: ParserState): Literal {
  // TODO: Implement literal parsing
  return {
    value: state.input[state.position],
  };
}

export function isTagArguments(state: ParserState): boolean {
  return state.input[state.position] === '(';
}

export function parseTagArguments(state: ParserState): Literal[] {
  const args: Literal[] = [];

  if (state.input[state.position] !== '(') {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  args.push(parseTagArgument(state));

  while (!isEof(state) && state.input[state.position] !== ')') {
    if (state.input[state.position] !== ',') {
      throw new Error('Unexpected character');
    }

    setPosition(state, state.position + 1);

    args.push(parseTagArgument(state));
  }

  if (state.input[state.position] !== ')') {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  return args;
}

export function parseTagArgument(state: ParserState): Literal {
  let isFirstCharacter = true;

  for (let position = state.position; position < state.input.length; position++) {
    const char = state.input[position];
    if (char === ')' || char === ',') {
      if (isFirstCharacter) {
        throw new Error('Unexpected character');
      }

      const value = state.input.slice(state.position, position);

      setPosition(state, position);

      return {
        value,
      };
    }

    isFirstCharacter = false;
  }

  throw new Error('Unexpected end-of-file');
}

export function isTagProperties(state: ParserState): boolean {
  return state.input[state.position] === '[';
}

export function parseTagProperties(state: ParserState): Property[] {
  const properties: Property[] = [];

  if (state.input[state.position] !== '[') {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  properties.push(parseTagProperty(state));

  while (!isEof(state) && state.input[state.position] !== ']') {
    if (state.input[state.position] !== ';') {
      throw new Error('Unexpected character');
    }

    setPosition(state, state.position + 1);

    properties.push(parseTagProperty(state));
  }

  if (state.input[state.position] !== ']') {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  return properties;
}

export function parseTagProperty(state: ParserState): Property {
  skipWhitespace(state);

  const identifier = parseTagPropertyIdentifier(state);

  skipWhitespace(state);

  if (state.input[state.position] !== '=') {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  skipWhitespace(state);

  const value = parseTagPropertyValue(state);

  skipWhitespace(state);

  if (state.input[state.position] !== ';' && state.input[state.position] !== ']') {
    throw new Error('Unexpected character');
  }

  return {
    identifier,
    value,
  };
}

export function parseTagPropertyIdentifier(state: ParserState): Identifier {
  let position: number;

  let expectLetter = true;
  let expectSeparator = false;
  let expectHyphen = false;
  let expectEndOfIdentifier = false;

  let isFirstLetter = true;

  for (position = state.position; position < state.input.length; position++) {
    if (expectLetter && /[a-z]/.test(state.input[position])) {
      if (isFirstLetter) {
        isFirstLetter = false;
        expectLetter = true;
        expectSeparator = true;
        expectHyphen = true;
        expectEndOfIdentifier = true;
      } else {
        expectLetter = true;
        expectSeparator = true;
        expectHyphen = true;
        expectEndOfIdentifier = true;
      }
    } else if (expectSeparator && state.input[position] === ':') {
      if (state.input[position + 1] === ':') {
        position++;
      } else {
        throw new Error('Unexpected character');
      }

      expectLetter = true;
      expectSeparator = false;
      expectHyphen = false;
      expectEndOfIdentifier = false;
    } else if (expectHyphen && state.input[position] === '-') {
      expectLetter = true;
      expectSeparator = false;
      expectHyphen = false;
      expectEndOfIdentifier = false;
    } else if (
      expectEndOfIdentifier &&
      (state.input[position] === '=' || state.input[position] === ' ')
    ) {
      break;
    } else {
      throw new Error('Unexpected character');
    }
  }

  const tagName = state.input.substring(state.position, position);

  setPosition(state, position);

  const identifier: Identifier = {
    name: tagName,
  };

  return identifier;
}

export function parseTagPropertyValue(state: ParserState): Literal {
  let position: number;

  for (position = state.position; position < state.input.length; position++) {
    const char = state.input[position];
    if (char === ';' || char === ']') {
      break;
    }
  }

  const value = state.input.slice(state.position, position);

  setPosition(state, position);

  return {
    value,
  };
}

export function isTagBlocks(state: ParserState): boolean {
  return state.input[state.position] === '{';
}

export function parseTagBlocks(state: ParserState): Block[] {
  const blocks: Block[] = [];

  if (state.input[state.position] !== '{') {
    throw new Error('Unexpected character');
  }

  blocks.push(parseTagBlock(state));

  while (!isEof(state) && state.input[state.position] !== ';') {
    skipWhitespace(state);

    blocks.push(parseTagBlock(state));
  }

  if (state.input[state.position] !== ';') {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  return blocks;
}

export function parseTagBlock(state: ParserState): Block {
  let children: Node[] = [];

  if (state.input[state.position] !== '{') {
    throw new Error('Unexpected character ' + state.input[state.position]);
  }

  setPosition(state, state.position + 1);

  children.push(parseNode(state));

  while (!isEof(state) && state.input[state.position] !== '}') {
    skipWhitespace(state);

    children.push(parseNode(state));
  }

  if (state.input[state.position] !== '}') {
    throw new Error('Unexpected character');
  }

  setPosition(state, state.position + 1);

  return {
    children,
  };
}

export function parseNode(state: ParserState): Node {
  if (state.input[state.position] === '\\') {
    return parseTag(state);
  }

  return parseText(state);
}
