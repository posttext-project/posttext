# PostText

A TypeScript library project.

## Installation

```bash
# Using npm
npm install posttext

# Using yarn
yarn add posttext

# Using pnpm
pnpm add posttext
```

## Usage

```typescript
import { add, PostText } from 'posttext';

// Using the add function
const sum = add(1, 2); // 3

// Using the PostText class
const instance = new PostText('custom-name');
console.log(instance.getName()); // 'custom-name'
instance.setName('updated-name');
console.log(instance.getName()); // 'updated-name'

// Using the default export
import posttext from 'posttext';
console.log(posttext.getName()); // 'default'
```

## Development

This project uses PNPM as the package manager.

```bash
# Install dependencies
pnpm install

# Build the library
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Development mode with watch
pnpm dev
```

## License

ISC
