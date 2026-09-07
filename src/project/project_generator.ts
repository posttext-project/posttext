import fs from 'fs';
import path from 'path';

/** Custom error indicating the template directory could not be found */
export class TemplateNotFoundError extends Error {
  constructor(location: string) {
    super(`Template not found at: ${location}`);
    this.name = 'TemplateNotFoundError';
  }
}

/** Thrown when the chosen output directory is not empty */
export class DirectoryNotEmptyError extends Error {
  constructor(dir: string) {
    super(`Target directory is not empty: ${dir}`);
    this.name = 'DirectoryNotEmptyError';
  }
}

export interface ProjectOptions {
  /** Core placeholder values */
  title: string;
  author: string;
  date?: string;
  target?: string;
  outputDir?: string;
  /**
   * Extra user-defined placeholders. Keys are case-insensitive.
   * Example: { publisher: 'ACME Inc.' }
   */
  placeholders?: Record<string, string>;
}

export interface TemplateFile {
  relativePath: string;
  content: string;
  isTemplate: boolean;
}

// Global regex used *only* for replacement; `containsPlaceholders` resets lastIndex.
const placeholderPattern = /<([^>]+)>/g;

export interface ProjectGenerator {
  generateProject(targetDir: string, options: ProjectOptions): Promise<void>;
  validateOptions(options: ProjectOptions): string[];
  listTemplates(templatePath: string): string[];
}

export function createProjectGenerator(templatePath?: string): ProjectGenerator {
  templatePath = resolveTemplatePath(templatePath);

  return {
    generateProject: (targetDir: string, options: ProjectOptions) =>
      generateProject(templatePath as string, targetDir, options),
    validateOptions,
    listTemplates,
  };
}

/** Resolve the actual template folder to use, searching common locations. */
function resolveTemplatePath(explicit?: string): string {
  if (explicit) {
    if (!fs.existsSync(explicit)) throw new TemplateNotFoundError(explicit);
    return explicit;
  }

  const candidates = [
    path.join(__dirname, '../templates/posttext'), // Dev source
    path.join(__dirname, '../../src/templates/posttext'), // Compiled dist
    path.join(process.cwd(), 'src/templates/posttext'),
    path.join(process.cwd(), 'templates/posttext'),
  ];

  const found = candidates.find(p => fs.existsSync(p));
  if (!found) throw new TemplateNotFoundError(candidates.join('\n'));
  return found;
}

/**
 * Generate a new PostText project from the chosen template folder. */
/** Generate a new PostText project from the chosen template folder. */
async function generateProject(
  templatePath: string,
  targetDir: string,
  options: ProjectOptions
): Promise<void> {
  if (!fs.existsSync(templatePath)) {
    throw new TemplateNotFoundError(templatePath);
  }

  // Ensure target directory exists
  if (!fs.existsSync(targetDir)) {
    await fs.promises.mkdir(targetDir, { recursive: true });
  }

  // Check if target directory is empty
  const existingFiles = await fs.promises.readdir(targetDir);
  if (existingFiles.length > 0) {
    throw new DirectoryNotEmptyError(targetDir);
  }

  // Set default values
  const templateOptions: Required<ProjectOptions> = {
    title: options.title,
    author: options.author,
    date: options.date || new Date().toISOString().split('T')[0],
    target: options.target || 'pdf',
    outputDir: options.outputDir || './build',
    placeholders: options.placeholders || {},
  };

  // Read and process template files
  const templateFiles = await readTemplateFiles(templatePath);

  // Generate files with placeholder replacement
  for (const templateFile of templateFiles) {
    const targetPath = path.join(targetDir, templateFile.relativePath);
    const targetDirPath = path.dirname(targetPath);

    // Ensure target directory exists
    if (!fs.existsSync(targetDirPath)) {
      await fs.promises.mkdir(targetDirPath, { recursive: true });
    }

    let content = templateFile.content;

    // Replace placeholders if this is a template file
    if (templateFile.isTemplate) {
      content = replacePlaceholders(content, templateOptions);
    }

    // Write the file
    await fs.promises.writeFile(targetPath, content, 'utf8');
  }

  console.log(`✅ PostText project generated successfully at: ${targetDir}`);
  console.log(`📚 Title: ${templateOptions.title}`);
  console.log(`👤 Author: ${templateOptions.author}`);
  console.log(`📅 Date: ${templateOptions.date}`);
  console.log(`🎯 Target: ${templateOptions.target}`);
}

/**
 * Recursively read all template files
 */
async function readTemplateFiles(dirPath: string, basePath?: string): Promise<TemplateFile[]> {
  const files: TemplateFile[] = [];
  const baseDir = basePath || dirPath;

  const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      // Recursively read subdirectories
      const subFiles = await readTemplateFiles(fullPath, baseDir);
      files.push(...subFiles);
    } else if (entry.isFile()) {
      // Skip .gitkeep files
      if (entry.name === '.gitkeep') {
        continue;
      }

      const content = await fs.promises.readFile(fullPath, 'utf8');
      const isTemplate = containsPlaceholders(content);

      files.push({
        relativePath,
        content,
        isTemplate,
      });
    }
  }

  return files;
}

/**
 * Check if content contains placeholders
 */
function containsPlaceholders(content: string): boolean {
  placeholderPattern.lastIndex = 0; // reset state due to global flag
  return placeholderPattern.test(content);
}

/**
 * Replace placeholders in content with actual values
 */
function replacePlaceholders(content: string, options: Required<ProjectOptions>): string {
  return content.replace(placeholderPattern, (match, placeholder) => {
    const key = placeholder.toLowerCase().trim();

    switch (key) {
      case 'title':
        return options.title;
      case 'author':
        return options.author;
      case 'date':
        return options.date;
      case 'target':
        return options.target;
      case 'output':
        return options.outputDir;
      default:
        // Check user-supplied placeholders
        if (options.placeholders && options.placeholders[key] !== undefined) {
          return options.placeholders[key];
        }
        console.warn(`Unknown placeholder: ${placeholder}`);
        return match;
    }
  });
}

/**
 * List available templates
 */
function listTemplates(templatePath: string): string[] {
  const templatesDir = path.dirname(templatePath);
  if (!fs.existsSync(templatesDir)) {
    return [];
  }

  return fs
    .readdirSync(templatesDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);
}

/**
 * Validate template options
 */
function validateOptions(options: ProjectOptions): string[] {
  const errors: string[] = [];

  if (!options.title || options.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!options.author || options.author.trim() === '') {
    errors.push('Author is required');
  }

  if (options.date && !isValidDate(options.date)) {
    errors.push('Date must be in YYYY-MM-DD format');
  }

  if (options.target && !['pdf', 'html', 'epub'].includes(options.target)) {
    errors.push('Target must be one of: pdf, html, epub');
  }

  if (errors.length) return errors;
  return [];
}

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}
