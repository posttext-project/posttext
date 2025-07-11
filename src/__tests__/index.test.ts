import { add, PostText } from '../index';

describe('add function', () => {
  it('adds two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, 1)).toBe(0);
    expect(add(0, 0)).toBe(0);
  });
});

describe('PostText class', () => {
  it('initializes with default name when no name provided', () => {
    const instance = new PostText();
    expect(instance.getName()).toBe('default');
  });

  it('initializes with provided name', () => {
    const instance = new PostText('test');
    expect(instance.getName()).toBe('test');
  });

  it('can update name after initialization', () => {
    const instance = new PostText();
    instance.setName('updated');
    expect(instance.getName()).toBe('updated');
  });
});
