import type { Grader } from '../../lib/contracts';
import { compileLocator, resolveLocator } from '../../runners/locator-expression';
import { inFixture } from './fixtures';

export const grade: Grader<'locator'> = async (problem, { value }) => {
  try {
    const selector = compileLocator(value, problem.syntax);
    const fixtures = await Promise.all([{ name: 'original', fixture: problem.fixture }, ...problem.variants].map(
      ({ name, fixture }) => inFixture(fixture, (doc) => {
        const actual = new Set(resolveLocator(doc, selector));
        const expected = Array.from(doc.querySelectorAll(problem.target));
        const matchedTarget = actual.size === expected.length && expected.every((element) => actual.has(element));
        return { name, matches: actual.size, matchedTarget };
      }),
    ));
    const score = fixtures.filter(({ matchedTarget }) => matchedTarget).length / fixtures.length;
    return { kind: 'locator', status: 'graded', score, details: { fixtures, warnings: selector.warnings } };
  } catch (error) {
    return { kind: 'locator', status: 'invalid-answer', message: error instanceof Error ? error.message : 'Unable to read the locator' };
  }
};
