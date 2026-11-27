import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import { root } from './problems';

/** Topic ids from the Phase 2 brief in its order, then the twelve phase 5 topics in the plan's order. */
export const questionTopics = [
  'fundamentals', 'test-design', 'bug-reports', 'agile', 'automation-strategy', 'locators-waits',
  'flaky-tests', 'playwright', 'selenium', 'api', 'ci-git-docker', 'behavioral', 'leadership',
  'framework-design', 'bdd', 'cypress', 'performance', 'security', 'ai-testing', 'system-design',
  'sql', 'java', 'python', 'javascript-typescript', 'containers',
] as const;

/** Example languages from the phase 5 plan; only the switchable ones may share an example. */
export const switchableLanguages = ['ts', 'js', 'python', 'java'] as const;
export const exampleLanguages = [
  ...switchableLanguages, 'sql', 'yaml', 'gherkin', 'bash', 'groovy', 'dockerfile', 'json', 'xml', 'http', 'properties',
] as const;

export interface ExampleVariant { lang: string; label: string; code: string }
export interface QuestionExample { title?: string; variants: ExampleVariant[] }

/**
 * Accessible name of a variant's code box: "Code example: <label>", optionally followed by context
 * such as the example number and the question title.
 */
export function exampleCodeName(variant: ExampleVariant) {
  return new RegExp(`^Code example: ${variant.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?:,|$)`);
}

/**
 * The `examples` field as written, unvalidated. Callers that need valid data run after
 * tests/content/questions.test.ts has checked the shape.
 */
export function questionExamples(question: DiscoveredQuestion): QuestionExample[] {
  const { examples } = question.frontmatter;
  return Array.isArray(examples) ? examples as QuestionExample[] : [];
}

export interface DiscoveredQuestion {
  /** Collection id and review key, for example `playwright/independent-checkout-contexts`. */
  id: string;
  folder: string;
  slug: string;
  /** Question page path relative to the `/pom-proof/` base URL. */
  path: string;
  file: string;
  frontmatter: Record<string, unknown>;
  body: string;
  /** 1-based line of the first body line in the file. */
  bodyLine: number;
}

/**
 * Reads every question file with the same frontmatter parser the Astro loader uses. The data is
 * left unvalidated on purpose: the questions test checks it against the brief, independently of
 * the collection schema.
 */
export function discoverQuestions(): DiscoveredQuestion[] {
  const base = join(root, 'content', 'questions');
  return readdirSync(base, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.md'))
    .sort()
    .map((file) => {
      const id = file.slice(0, -'.md'.length).split(sep).join('/');
      const text = readFileSync(join(base, file), 'utf8');
      const { frontmatter, content } = parseFrontmatter(text);
      const [folder = '', slug = ''] = id.split('/');
      return {
        id,
        folder,
        slug,
        path: `questions/${id}/`,
        file: relative(root, join(base, file)),
        frontmatter: frontmatter as Record<string, unknown>,
        body: content,
        bodyLine: text.slice(0, text.length - content.length).split('\n').length,
      };
    });
}

/** Title of a question, failing loudly when the frontmatter has none. */
export function questionTitle(question: DiscoveredQuestion): string {
  const { title } = question.frontmatter;
  if (typeof title !== 'string' || !title.trim()) throw new Error(`${question.file} has no title`);
  return title;
}
