import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import { root } from './problems';

/** Topic ids from the Phase 2 brief, in the brief's order. */
export const questionTopics = [
  'fundamentals', 'test-design', 'bug-reports', 'agile', 'automation-strategy', 'locators-waits',
  'flaky-tests', 'playwright', 'selenium', 'api', 'ci-git-docker', 'behavioral', 'leadership',
] as const;

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
