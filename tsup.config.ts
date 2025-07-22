import { defineConfig } from 'tsup';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

// Function to recursively copy directory
function copyDir(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      mkdirSync(dirname(destPath), { recursive: true });
      copyFileSync(srcPath, destPath);
    }
  }
}

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
    onSuccess: async () => {
      // Copy templates to dist directory
      try {
        copyDir('src/templates', 'dist/templates');
        console.log('✅ Templates copied to dist/templates');
      } catch (error) {
        console.warn('⚠️ Failed to copy templates:', error);
      }
    },
  },
]);
