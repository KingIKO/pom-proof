import type { Answer, GradeResult, Json, Problem } from '../../lib/contracts';

type MutationValue = Answer<'test-design'>['value'];
type TableAnswer = Extract<MutationValue, { rows: unknown }>;
type Param = NonNullable<Problem<'test-design'>['params']>[number];
type Candidate = (...args: unknown[]) => unknown;
type LoadFunction = (source: string, name: string) => Promise<Candidate>;

export type MutationRequest = Pick<Problem<'test-design'>, 'exportName' | 'implementation' | 'mutants' | 'params'>
  & { answer: MutationValue };

export const invalid = (message: string): GradeResult<'test-design'> => ({
  kind: 'test-design', status: 'invalid-answer', message,
});

export function matchesParam(value: unknown, param: Param) {
  if (param.type === 'enum') return typeof value === 'string' && param.values.includes(value);
  if (param.type === 'number') return typeof value === 'number' && Number.isFinite(value);
  return typeof value === param.type;
}

function equalJson(actual: unknown, expected: Json): boolean {
  if (expected === null || typeof expected !== 'object') return actual === expected;
  if (Array.isArray(expected)) {
    return Array.isArray(actual) && actual.length === expected.length
      && expected.every((value, index) => Object.hasOwn(actual, index) && equalJson(actual[index], value));
  }
  if (!actual || typeof actual !== 'object' || Array.isArray(actual)) return false;
  const prototype: unknown = Object.getPrototypeOf(actual);
  if (prototype !== Object.prototype && prototype !== null) return false;
  const keys = Object.keys(expected);
  return Object.keys(actual).length === keys.length && keys.every((key) => (
    Object.hasOwn(actual, key) && equalJson((actual as Record<string, unknown>)[key], expected[key]!)
  ));
}

async function failedRows(fn: Candidate, rows: TableAnswer['rows']): Promise<number[]> {
  const failures: number[] = [];
  for (const [index, row] of rows.entries()) {
    try {
      const output = await fn(...structuredClone(row.args));
      if (equalJson(output, row.expected)) continue;
    } catch {
      // A throw also disagrees with an expected JSON value.
    }
    failures.push(index + 1);
  }
  return failures;
}

const describe = (error: unknown) => error instanceof Error ? error.message : String(error);
const falsePositive = 'This row fails on the real function. The test would report a bug that is not there.';

export async function gradeSuite(request: MutationRequest, load: LoadFunction): Promise<GradeResult<'test-design'>> {
  const { answer, exportName, implementation, mutants, params } = request;
  let evaluate: (fn: Candidate) => Promise<{ failedRows: number[]; referenceFailure?: string }>;
  if ('rows' in answer) {
    const { rows } = answer;
    if (!rows.length) return invalid('Add at least one test row');
    const invalidRow = rows.findIndex(({ args }) => params
      && (args.length !== params.length || !params.every((param, index) => matchesParam(args[index], param))));
    if (invalidRow >= 0) return invalid(`Row ${invalidRow + 1} needs one value of the right type per input`);
    evaluate = async (fn) => ({ failedRows: await failedRows(fn, rows) });
  } else {
    if (!answer.source.trim()) return invalid('Write a test before submitting');
    evaluate = async (fn) => {
      const test = await load(answer.source, 'test');
      try {
        await test(fn);
        return { failedRows: [] };
      } catch (error) {
        return { failedRows: [], referenceFailure: describe(error) || 'Assertion failed' };
      }
    };
  }

  try {
    const reference = await evaluate(await load(implementation, exportName));
    const validOnReference = reference.failedRows.length === 0 && reference.referenceFailure === undefined;
    const results: Array<{ name: string; killed: boolean; teaches?: string }> = [];
    for (const mutant of mutants) {
      if (!validOnReference) {
        results.push({ name: mutant.name, killed: false });
        continue;
      }
      const outcome = await evaluate(await load(mutant.implementation, exportName));
      const killed = outcome.failedRows.length > 0 || outcome.referenceFailure !== undefined;
      results.push({ name: mutant.name, killed, ...(killed ? {} : { teaches: mutant.teaches }) });
    }
    return {
      kind: 'test-design',
      status: 'graded',
      score: results.filter(({ killed }) => killed).length / results.length,
      details: {
        referenceFailure: reference.referenceFailure,
        failedRows: reference.failedRows.map((row) => ({ row, message: falsePositive })),
        validOnReference,
        mutants: results,
      },
    };
  } catch (error) {
    return invalid(describe(error));
  }
}
