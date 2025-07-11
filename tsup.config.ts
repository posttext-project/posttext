import { defineConfig } from 'tsup';

export default defineConfig([
  // Main library configuration
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    splitting: false,
    sourcemap: true,
    clean: true,
  },
  // CLI configuration
  {
    entry: {
      'cli/index': 'src/cli/index.ts'
    },
    format: ['cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    // No banner needed as we're using a separate bin script
    // Ensure CLI dependencies are bundled
    noExternal: ['commander'],
  },
]);
