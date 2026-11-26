import { expect, test, type Page } from '@playwright/test';
import type { Answer, GradeResult } from '../../src/lib/contracts';
import { discoverProblems, kinds, type DiscoveredProblem } from '../support/problems';

const problems = discoverProblems();

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
}

test.describe('every kind has problems to prove', () => {
  for (const kind of kinds) {
    test(`${kind}: at least one problem exists`, () => {
      expect(problems.filter((problem) => problem.kind === kind), `No ${kind} problem under content/problems`)
        .not.toHaveLength(0);
    });
  }
});

for (const problem of problems) {
  test(`${problem.id}: reference scores 1 and decoy scores below 1`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await openWorkspace(page, problem);

    const { data } = problem;
    await expectFullMarks(page, problem, { kind: data.kind, value: data.reference } as Answer, 'reference');
    if (data.kind === 'test-design' && data.rowsReference) {
      await expectFullMarks(page, problem, { kind: data.kind, value: data.rowsReference }, 'table reference');
    }

    const decoy = await grade(page, { kind: data.kind, value: data.decoy } as Answer);
    expect(decoy, `${problem.id} decoy`).toMatchObject({ kind: problem.kind, status: 'graded' });
    const decoyScore = (decoy as { score?: number }).score;
    expect(decoyScore, `${problem.id} decoy score`).toBeGreaterThanOrEqual(0);
    expect(decoyScore, `${problem.id} decoy score`).toBeLessThan(1);
    expect(checksOf(decoy).filter(({ passed }) => !passed), `${problem.id} decoy must name a failed check`)
      .not.toHaveLength(0);

    expect(errors, `${problem.id} page errors`).toEqual([]);
  });
}
