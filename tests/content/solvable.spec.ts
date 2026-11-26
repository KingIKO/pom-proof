import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import { expect, test, type Page } from '@playwright/test';
import type { Answer, GradeResult } from '../../src/lib/contracts';
import { discoverProblems, kinds, root, type DiscoveredProblem } from '../support/problems';

const problems = discoverProblems();
const solutionLanguages = ['js', 'ts', 'python'] as const;

/** The editorial files, read the way the Astro loader reads them. */
const editorials = readdirSync(join(root, 'content', 'editorials'))
  .filter((file) => file.endsWith('.md'))
  .sort()
  .map((file) => {
    const { frontmatter } = parseFrontmatter(readFileSync(join(root, 'content', 'editorials', file), 'utf8'));
    return { slug: file.slice(0, -'.md'.length), problem: (frontmatter as { problem?: unknown }).problem };
  });

/** Languages a code problem has no solution for; the brief requires all three. */
function missingSolutions(data: DiscoveredProblem['data']) {
  if (data.kind !== 'code') return [];
  return solutionLanguages.filter((language) => !data.solutions?.[language]?.trim());
}

type Check = { name: string; passed: boolean };

/** Flattens each kind's details into named pass or fail checks. */
function checksOf(result: GradeResult): Check[] {
  if (result.status !== 'graded') return [];
  switch (result.kind) {
    case 'scenario':
    case 'diagnosis':
    case 'bug-report':
      return result.details.items.map(({ id, passed }) => ({ name: `item ${id}`, passed }));
    case 'test-design':
      return [
        { name: 'passes on the real implementation', passed: result.details.validOnReference },
        ...result.details.mutants.map(({ name, killed }) => ({ name: `mutant ${name}`, passed: killed })),
      ];
    case 'locator':
      // matchedTarget is set identity with the target selector's elements, so it already fixes the count.
      return result.details.fixtures.map(({ name, matchedTarget }) => ({ name: `fixture ${name}`, passed: matchedTarget }));
    case 'sql':
      return result.details.datasets.map(({ name, passed }) => ({ name: `dataset ${name}`, passed }));
    case 'code':
      return result.details.vectors.map(({ name, passed }) => ({ name: `vector ${name}`, passed }));
  }
}

/**
 * Checks the grader must report for this problem, named the same way as `checksOf`, and the
 * least number of checks. Code names hidden vectors generically, so only their count is fixed.
 */
function requiredChecks({ data }: DiscoveredProblem): { names: string[]; count: number } {
  const named = (names: string[]) => ({ names, count: names.length });
  switch (data.kind) {
    case 'scenario':
    case 'diagnosis':
    case 'bug-report':
      return named(data.items.map(({ id }) => `item ${id}`));
    case 'test-design':
      return named(['passes on the real implementation', ...data.mutants.map(({ name }) => `mutant ${name}`)]);
    case 'locator':
      return named(data.variants.map(({ name }) => `fixture ${name}`));
    case 'sql':
      return named(['dataset seed', 'dataset altered-seed']);
    case 'code':
      return { names: [], count: data.vectors.length };
  }
}

async function openWorkspace(page: Page, problem: DiscoveredProblem) {
  const response = await page.goto(problem.path);
  expect(response?.status(), `${problem.path} did not load`).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: problem.data.title })).toBeVisible();
  await expect.poll(
    () => page.evaluate(() => typeof window.__pomproof?.grade),
    { message: `${problem.path} never registered window.__pomproof.grade` },
  ).toBe('function');
}

/** The answer crosses as JSON text; typing it through `page.evaluate` expands the Answer union too deeply. */
function grade(page: Page, answer: Answer): Promise<GradeResult> {
  return page.evaluate((json) => window.__pomproof!.grade(JSON.parse(json) as Answer), JSON.stringify(answer));
}

async function expectFullMarks(page: Page, problem: DiscoveredProblem, answer: Answer, label: string) {
  const result = await grade(page, answer);
  expect(result, `${problem.id} ${label}`).toMatchObject({ kind: problem.kind, status: 'graded', score: 1 });
  const checks = checksOf(result);
  const required = requiredChecks(problem);
  expect(checks.map(({ name }) => name), `${problem.id} ${label} must report every check`)
    .toEqual(expect.arrayContaining(required.names));
  expect(checks.length, `${problem.id} ${label} check count`).toBeGreaterThanOrEqual(Math.max(required.count, 1));
  expect(checks.filter(({ passed }) => !passed), `${problem.id} ${label} failed checks`).toEqual([]);
  proven(label);
}

/** Records an answer that met its check, so the report can count what the gate actually graded. */
function proven(label: string) {
  test.info().annotations.push({ type: 'proven', description: label });
}

test.describe('every kind has problems to prove', () => {
  for (const kind of kinds) {
    test(`${kind}: at least one problem exists`, () => {
      expect(problems.filter((problem) => problem.kind === kind), `No ${kind} problem under content/problems`)
        .not.toHaveLength(0);
    });
  }
});

test('every code problem has a js, ts and python solution', () => {
  const code = problems.filter(({ kind }) => kind === 'code');
  expect(code, 'No code problem under content/problems').not.toHaveLength(0);
  expect(code.map(({ id, data }) => ({ id, missing: missingSolutions(data) })).filter(({ missing }) => missing.length),
    'code problems without all three solutions').toEqual([]);
});

test('every problem has an editorial and every editorial names an existing problem', () => {
  expect(problems.length, 'no problems under content/problems').toBeGreaterThan(0);
  expect(editorials.length, 'no editorials under content/editorials').toBeGreaterThan(0);
  const ids = new Set(problems.map(({ id }) => id));
  const bySlug = new Map(editorials.map((editorial) => [editorial.slug, editorial]));
  expect(problems.filter(({ slug }) => !bySlug.has(slug)).map(({ id }) => id), 'problems without content/editorials/<id>.md')
    .toEqual([]);
  expect(problems.filter(({ id, slug }) => bySlug.has(slug) && bySlug.get(slug)!.problem !== id)
    .map(({ id, slug }) => `${slug}.md names "${String(bySlug.get(slug)!.problem)}", expected "${id}"`), 'editorials naming the wrong problem')
    .toEqual([]);
  expect(editorials.filter(({ problem }) => typeof problem !== 'string' || !ids.has(problem))
    .map(({ slug, problem }) => `${slug}.md names "${String(problem)}"`), 'editorials naming a problem that does not exist')
    .toEqual([]);
});

for (const problem of problems) {
  test(`${problem.id}: reference scores 1 and decoy scores below 1`, async ({ page }) => {
    // Code problems also load Python. 2A's runner allows 60 s for the first Pyodide load
    // (src/runners/python-browser.ts), so the default 30 s test budget is too short for them.
    if (problem.kind === 'code') test.setTimeout(90_000);
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openWorkspace(page, problem);

    const { data } = problem;
    await expectFullMarks(page, problem, { kind: data.kind, value: data.reference } as Answer, 'reference');
    if (data.kind === 'test-design' && data.rowsReference) {
      await expectFullMarks(page, problem, { kind: data.kind, value: data.rowsReference }, 'table reference');
    }
    if (data.kind === 'code') {
      expect(missingSolutions(data), `${problem.id} must have js, ts and python solutions`).toEqual([]);
      // Graded on the page already open, so the Python solution reuses its Pyodide load.
      for (const language of solutionLanguages) {
        await expectFullMarks(page, problem, { kind: 'code', value: { language, source: data.solutions![language] } },
          `${language} solution`);
      }
    }

    const decoy = await grade(page, { kind: data.kind, value: data.decoy } as Answer);
    expect(decoy, `${problem.id} decoy`).toMatchObject({ kind: problem.kind, status: 'graded' });
    const decoyScore = (decoy as { score?: number }).score;
    expect(decoyScore, `${problem.id} decoy score`).toBeGreaterThanOrEqual(0);
    expect(decoyScore, `${problem.id} decoy score`).toBeLessThan(1);
    expect(checksOf(decoy).filter(({ passed }) => !passed), `${problem.id} decoy must name a failed check`)
      .not.toHaveLength(0);
    proven('decoy');

    expect(errors, `${problem.id} page errors`).toEqual([]);
  });
}
