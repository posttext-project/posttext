#!/usr/bin/env node

import { Command } from 'commander';

// Import command registration functions
import { buildCommand } from './commands/build';
import { helpCommand } from './commands/help';
import { newCommand } from './commands/new';
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

// Register commands
buildCommand(program);
newCommand(program);
helpCommand(program);

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
