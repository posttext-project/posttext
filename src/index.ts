/**
 * PostText - A TypeScript library
 */

/**
 * Example function that adds two numbers
 * @param a First number
 * @param b Second number
 * @returns Sum of a and b
 */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Example class with basic functionality
 */
export class PostText {
  private name: string;

  /**
   * Create a new PostText instance
   * @param name Name to initialize with
   */
  constructor(name: string = 'default') {
    this.name = name;
  }

  /**
   * Get the current name
   * @returns The current name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Set a new name
   * @param name New name to set
   */
  setName(name: string): void {
    this.name = name;
  }
}

// Export default instance
export default new PostText();
