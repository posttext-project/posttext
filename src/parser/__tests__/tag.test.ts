import {
  parseTagIdentifier,
  parseTagProperties,
  parseTagPropertyIdentifier,
  parseTagPropertyValue,
} from '../tag';
import { createParserState, setPosition } from '../state';
import { parseTagArguments } from '../tag';

describe('parseTagIdentifier', () => {
  it('parses a single identifier', () => {
    const state = createParserState('\\foo ');
    setPosition(state, 1);
    const identifier = parseTagIdentifier(state);
    expect(identifier).toEqual({ name: 'foo' });
  });

  it('parses a namespaced identifier', () => {
    const state = createParserState('\\foo::bar ');
    setPosition(state, 1);
    const identifier = parseTagIdentifier(state);
    expect(identifier).toEqual({ name: 'foo::bar' });
  });

  it('parses a deep namespaced identifier', () => {
    const state = createParserState('\\foo::bar::baz ');
    setPosition(state, 1);
    const identifier = parseTagIdentifier(state);
    expect(identifier).toEqual({ name: 'foo::bar::baz' });
  });

  it('throws an error when only one colon is used', () => {
    const state = createParserState('\\foo:bar ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws an error when more than two consecutive separators are used', () => {
    const state = createParserState('\\foo::::bar ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('parses an identifier with a hyphen', () => {
    const state = createParserState('\\foo-bar ');
    setPosition(state, 1);
    const identifier = parseTagIdentifier(state);
    expect(identifier).toEqual({ name: 'foo-bar' });
  });

  it('parses an identifier with many hyphens', () => {
    const state = createParserState('\\foo-bar-baz ');
    setPosition(state, 1);
    const identifier = parseTagIdentifier(state);
    expect(identifier).toEqual({ name: 'foo-bar-baz' });
  });

  it('parses an identifier with a hyphen and a namespace', () => {
    const state = createParserState('\\foo::bar-baz ');
    setPosition(state, 1);
    const identifier = parseTagIdentifier(state);
    expect(identifier).toEqual({ name: 'foo::bar-baz' });
  });

  it('throws an error when two consecutive hyphens are used', () => {
    const state = createParserState('\\foo--bar ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws an error when identifier is missing', () => {
    const state = createParserState('\\ ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws an error when identifier is not a letter', () => {
    const state = createParserState('\\1 ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws when identifier is started with a hyphen', () => {
    const state = createParserState('\\-foo ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws when identifier is ended with a hyphen', () => {
    const state = createParserState('\\foo- ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws when identifier is started with separator', () => {
    const state = createParserState('\\::foo ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws when identifier is ended with separator', () => {
    const state = createParserState('\\foo:: ');
    setPosition(state, 1);
    expect(() => parseTagIdentifier(state)).toThrow('Unexpected character');
  });
});

describe('parseTagArguments', () => {
  it('parses a single argument', () => {
    const state = createParserState('\\(foo) ');
    setPosition(state, 1);
    const args = parseTagArguments(state);
    expect(args).toEqual([
      {
        value: 'foo',
      },
    ]);
  });

  it('throws an error when argument is missing', () => {
    const state = createParserState('\\() ');
    setPosition(state, 1);
    expect(() => parseTagArguments(state)).toThrow('Unexpected character');
  });

  it('parses multiple arguments', () => {
    const state = createParserState('\\(foo,bar) ');
    setPosition(state, 1);
    const args = parseTagArguments(state);
    expect(args).toEqual([
      {
        value: 'foo',
      },
      {
        value: 'bar',
      },
    ]);
  });

  it('throws an error when argument is missing', () => {
    const state = createParserState('\\(foo,bar,) ');
    setPosition(state, 1);
    expect(() => parseTagArguments(state)).toThrow('Unexpected character');
  });
});

describe('parseTagPropertyIdentifier', () => {
  it('parses a single identifier', () => {
    const state = createParserState('\\[foo=bar] ');
    setPosition(state, 2);
    const identifier = parseTagPropertyIdentifier(state);
    expect(identifier).toEqual({ name: 'foo' });
  });

  it('throws an error when identifier is missing', () => {
    const state = createParserState('\\[=bar] ');
    setPosition(state, 2);
    expect(() => parseTagPropertyIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws an error when identifier is not a letter', () => {
    const state = createParserState('\\[1=bar] ');
    setPosition(state, 2);
    expect(() => parseTagPropertyIdentifier(state)).toThrow('Unexpected character');
  });

  it('parses an identifier with a hyphen', () => {
    const state = createParserState('\\[foo-bar=bar] ');
    setPosition(state, 2);
    const identifier = parseTagPropertyIdentifier(state);
    expect(identifier).toEqual({ name: 'foo-bar' });
  });

  it('parses an identifier with many hyphens', () => {
    const state = createParserState('\\[foo-bar-baz=bar] ');
    setPosition(state, 2);
    const identifier = parseTagPropertyIdentifier(state);
    expect(identifier).toEqual({ name: 'foo-bar-baz' });
  });

  it('throws an error when identifier is started with a hyphen', () => {
    const state = createParserState('\\[-foo=bar] ');
    setPosition(state, 2);
    expect(() => parseTagPropertyIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws an error when identifier is ended with a hyphen', () => {
    const state = createParserState('\\[foo-=bar] ');
    setPosition(state, 2);
    expect(() => parseTagPropertyIdentifier(state)).toThrow('Unexpected character');
  });

  it('parses an identifier with a namespace', () => {
    const state = createParserState('\\[foo::bar=bar] ');
    setPosition(state, 2);
    const identifier = parseTagPropertyIdentifier(state);
    expect(identifier).toEqual({ name: 'foo::bar' });
  });

  it('parses an identifier with many namespaces', () => {
    const state = createParserState('\\[foo::bar::baz=bar] ');
    setPosition(state, 2);
    const identifier = parseTagPropertyIdentifier(state);
    expect(identifier).toEqual({ name: 'foo::bar::baz' });
  });

  it('throws an error when identifier is started with a separator', () => {
    const state = createParserState('\\[::foo=bar] ');
    setPosition(state, 2);
    expect(() => parseTagPropertyIdentifier(state)).toThrow('Unexpected character');
  });

  it('throws an error when identifier is ended with a separator', () => {
    const state = createParserState('\\[foo::=bar] ');
    setPosition(state, 2);
    expect(() => parseTagPropertyIdentifier(state)).toThrow('Unexpected character');
  });
});

describe('parseTagPropertyValue', () => {
  it('parses a string value', () => {
    const state = createParserState('\\[foo=bar] ');
    setPosition(state, 6);
    const value = parseTagPropertyValue(state);
    expect(value).toEqual({ value: 'bar' });
  });

  it('parses a string value', () => {
    const state = createParserState('\\[foo=bar; baz=qux] ');
    setPosition(state, 6);
    const value = parseTagPropertyValue(state);
    expect(value).toEqual({ value: 'bar' });
  });

  it('parses an empty value', () => {
    const state = createParserState('\\[foo=bar; baz=] ');
    setPosition(state, 15);
    const value = parseTagPropertyValue(state);
    expect(value).toEqual({ value: '' });
  });
});

describe('parseTagProperties', () => {
  it('parses a single property', () => {
    const state = createParserState('\\[foo=bar] ');
    setPosition(state, 1);
    const properties = parseTagProperties(state);
    expect(properties).toEqual([
      {
        identifier: { name: 'foo' },
        value: { value: 'bar' },
      },
    ]);
  });

  it('parses multiple properties', () => {
    const state = createParserState('\\[foo=bar; baz=qux] ');
    setPosition(state, 1);
    const properties = parseTagProperties(state);
    expect(properties).toEqual([
      {
        identifier: { name: 'foo' },
        value: { value: 'bar' },
      },
      {
        identifier: { name: 'baz' },
        value: { value: 'qux' },
      },
    ]);
  });

  it('throws when no properties are provided', () => {
    const state = createParserState('\\[] ');
    setPosition(state, 1);
    expect(() => parseTagProperties(state)).toThrow('Unexpected character');
  });

  it('throws when property is missing', () => {
    const state = createParserState('\\[foo=bar; baz] ');
    setPosition(state, 1);
    expect(() => parseTagProperties(state)).toThrow('Unexpected character');
  });

  it('parses properties with empty values', () => {
    const state = createParserState('\\[foo=bar; baz=] ');
    setPosition(state, 1);
    const properties = parseTagProperties(state);
    expect(properties).toEqual([
      {
        identifier: { name: 'foo' },
        value: { value: 'bar' },
      },
      {
        identifier: { name: 'baz' },
        value: { value: '' },
      },
    ]);
  });
});
