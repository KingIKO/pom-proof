import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import type { Kind } from '../../src/lib/contracts';
import { kindLabel } from '../../src/lib/labels';
import { problemSchema, type ProblemData } from '../../src/lib/problem-schema';

export const root = resolve(import.meta.dirname, '../..');
export const kinds = Object.keys(kindLabel) as Kind[];

export interface DiscoveredProblem {
  /** Collection id, for example `code/classify-test-retries`. */
  id: string;
  kind: Kind;
  slug: string;
  /** Workspace path relative to the `/pom-proof/` base URL. */
  path: string;
  file: string;
  data: ProblemData;
}

/**
 * Reads every problem file the way the Astro content loader does (same frontmatter parser,
 * same schema). Throws on a file that does not parse, so a broken problem fails the run
 * instead of being left out of it.
 */
export function discoverProblems(): DiscoveredProblem[] {
  const base = join(root, 'content', 'problems');
  const files = readdirSync(base, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith('.md'))
    .sort();
  return files.map((file) => {
    const id = file.slice(0, -'.md'.length).split(sep).join('/');
    const { frontmatter } = parseFrontmatter(readFileSync(join(base, file), 'utf8'));
    const parsed = problemSchema.safeParse(frontmatter);
    if (!parsed.success) {
      throw new Error(`content/problems/${id}.md does not match the problem schema: ${parsed.error.message}`);
    }
    const slug = id.split('/').at(-1)!;
    return {
      id,
      kind: parsed.data.kind,
      slug,
      path: `practice/${parsed.data.kind}/${slug}/`,
      file: relative(root, join(base, file)),
      data: parsed.data,
    };
  });
}

/** One problem per kind, failing loudly when a kind has none. */
export function onePerKind(problems = discoverProblems()) {
  return kinds.map((kind) => {
    const problem = problems.find((candidate) => candidate.kind === kind);
    if (!problem) throw new Error(`No ${kind} problem under content/problems`);
    return problem;
  });
}
