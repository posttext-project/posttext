import { Command } from 'commander';
import path from 'path';
import { createProjectGenerator } from '../../project/project_generator';

/**
 * Execute the `new` command to scaffold a new PostText project.
 */
async function executeNew(
  projectName: string,
  options: {
    title?: string;
    author?: string;
    date?: string;
    target?: string;
  }
): Promise<void> {
  try {
    const generator = createProjectGenerator();

    // Use project name as title if not provided
    const templateOptions = {
      title: options.title || projectName,
      author: options.author || 'Unknown Author',
      date: options.date,
      target: options.target,
    };

    // Validate options
    const errors = generator.validateOptions(templateOptions);
    if (errors.length > 0) {
      console.error('❌ Validation errors:');
      errors.forEach(error => console.error(`  - ${error}`));
      process.exit(1);
    }

    const targetDir = path.resolve(process.cwd(), projectName);

    // Generate the project
    await generator.generateProject(targetDir, templateOptions);

    console.log('\n🎉 Project created successfully!');
    console.log(`📂 Location: ${targetDir}`);
    console.log('\n📋 Next steps:');
    console.log(`  1. cd ${projectName}`);
    console.log('  2. Edit the .pt files in the docs/ directory');
    console.log('  3. Run `posttext build` to compile your project');
  } catch (error) {
    console.error(
      '❌ Error creating project:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

/**
 * Register the `new` command with the CLI program.
 */
export function newCommand(program: Command): void {
  program
    .command('new <project-name>')
    .description('Create a new PostText project from template')
    .option('-t, --title <title>', 'project title')
    .option('-a, --author <author>', 'project author')
    .option('-d, --date <date>', 'project date (YYYY-MM-DD format)')
    .option('--target <target>', 'build target (pdf, html, epub)', 'pdf')
    .action(executeNew);
}
