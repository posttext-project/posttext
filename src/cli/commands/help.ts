import { Command } from 'commander';

/**
 * Implementation of the help command
 * This extends the built-in help with additional information and examples
 */
function executeHelp(): void {
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
}

/**
 * Register the help command with the CLI program
 * @param program Commander program instance
 */
export function helpCommand(program: Command): void {
  program.command('help').description('Display help information').action(executeHelp);
}
