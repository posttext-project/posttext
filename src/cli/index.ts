#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs';
import path from 'path';

// Read package.json for version
const packageJsonPath = path.resolve(__dirname, '../../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Create the main program
const program = new Command();

// Set basic information
program
  .name('posttext')
  .description('PostText CLI - A TypeScript library with CLI capabilities')
  .version(version);

// Build command implementation
program
  .command('build')
  .description('Build the project')
  .option('-o, --output <directory>', 'output directory for build artifacts')
  .option('-w, --watch', 'watch for changes and rebuild')
  .action(async (options: { output?: string; watch?: boolean }) => {
    const outputDir = options.output || 'dist';
    const watchMode = options.watch || false;

    console.log(`Building project...`);
    console.log(`Output directory: ${outputDir}`);

    if (watchMode) {
      console.log('Watch mode enabled. Watching for changes...');
    }

    try {
      // Ensure output directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Here you would implement the actual build logic
      // For now, we'll just simulate a build process
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log('Build completed successfully!');

      if (watchMode) {
        console.log('Still watching for changes... (Press Ctrl+C to stop)');
        // In a real implementation, you would set up file watchers here
      }
    } catch (error) {
      console.error('Build failed:', error);
      process.exit(1);
    }
  });

// Help command implementation
program
  .command('help')
  .description('Display help information')
  .action(() => {
    console.log(`
PostText CLI Help
================

PostText is a TypeScript library with CLI capabilities.

Available Commands:
  build       Build the project
  help        Display help information

Examples:
  $ posttext build                  # Build the project with default settings
  $ posttext build --output ./out   # Build the project to a custom directory
  $ posttext build --watch          # Build and watch for changes
  $ posttext help                   # Show this help information

For more information, visit: https://github.com/yourusername/posttext
`);
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(
    `\nError: Invalid command: ${program.args.join(' ')}\n` +
      `See --help for a list of available commands.\n`
  );
  process.exit(1);
});

// Parse command line arguments
program.parse(process.argv);

// Show help if no arguments provided
if (process.argv.length === 2) {
  program.help();
}
