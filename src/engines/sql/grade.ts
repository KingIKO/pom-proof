import type { Answer, GradeResult, Grader, Problem } from '../../lib/contracts';
import { hasOutputOrder, sameRows, SqlTimeoutError, type SqlRunner, type SqlTable } from '../../runners/sql';

export const hiddenDatasetMiss = 'Your query returned the right rows for the visible data. It did not pass on a second set of data with different rows. Check for hard-coded values, such as numbers copied from the visible data. Also check for a missing join condition, the rule for matching rows between tables.';
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

export async function checkSql(
  problem: Problem<'sql'>,
  answer: Answer<'sql'>,
  runner: Pick<SqlRunner, 'compare'>,
): Promise<{ result: GradeResult<'sql'>; table?: SqlTable; hiddenError?: string }> {
  const invalid = (message: string) => ({ result: { kind: 'sql', status: 'invalid-answer', message } } as const);
  const query = answer.value?.query;
  if (typeof query !== 'string' || !query.trim()) return invalid('Enter a query to check.');

  const { reference, schema, seed, alteredSeed } = problem;
  const ordered = hasOutputOrder(reference.query);
  let visible;
  try {
    visible = await runner.compare(schema, seed, reference.query, query);
  } catch (error) {
    return invalid(errorMessage(error));
  }

  const visiblePassed = sameRows(visible.actual, visible.expected, ordered);
  let hiddenPassed = false;
  let hiddenError: string | undefined;
  try {
    const { actual, expected } = await runner.compare(schema, alteredSeed, reference.query, query);
    hiddenPassed = sameRows(actual, expected, ordered);
  } catch (error) {
    if (error instanceof SqlTimeoutError) return invalid(error.message);
    hiddenError = errorMessage(error);
  }

  return {
    result: {
      kind: 'sql',
      status: 'graded',
      score: (Number(visiblePassed) + Number(hiddenPassed)) / 2,
      details: { datasets: [
        { name: 'seed', passed: visiblePassed },
        { name: 'altered-seed', passed: hiddenPassed },
      ] },
    },
    table: visible.actual,
    hiddenError,
  };
}

export const createSqlGrader = (runner: Pick<SqlRunner, 'compare'>): Grader<'sql'> =>
  async (problem, answer) => (await checkSql(problem, answer, runner)).result;
