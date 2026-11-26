import type { Answer, GradeResult, Grader, Problem } from '../../lib/contracts';
import type { CodeCheck, CodeRunner } from '../../runners/code-evaluate';

const visibleCount = (problem: Problem<'code'>) => Math.ceil(problem.vectors.length / 2);

export async function checkCode(
  problem: Problem<'code'>,
  answer: Answer<'code'>,
  run: CodeRunner,
  mode: 'run' | 'submit',
): Promise<{ result: GradeResult<'code'>; checks?: CodeCheck[] }> {
  const invalid = (message: string) => ({ result: { kind: 'code', status: 'invalid-answer', message } } as const);
  const language = answer.value?.language;
  const source = answer.value?.source;
  if (language === 'python') return invalid('Python arrives soon.');
  if (language !== 'ts' && language !== 'js') return invalid('Choose JavaScript or TypeScript.');
  if (typeof source !== 'string' || !source.trim()) return invalid('Enter a solution to run the checks.');

  const visible = visibleCount(problem);
  const vectors = mode === 'run' ? problem.vectors.slice(0, visible) : problem.vectors;
  let reply;
  try {
    reply = await run({
      source, language, exportName: problem.exportName,
      vectors: vectors.map(({ args, expected }, index) => ({ args, expected, visible: index < visible })),
    });
  } catch (error) {
    return invalid(error instanceof Error ? error.message : String(error));
  }
  if ('error' in reply) return invalid(reply.error);
  const details = reply.checks.map(({ passed }, index) => ({
    name: index < visible ? vectors[index].name : `Hidden check ${index - visible + 1}`,
    passed,
  }));
  return {
    checks: reply.checks,
    result: {
      kind: 'code',
      status: 'graded',
      score: details.filter(({ passed }) => passed).length / vectors.length,
      details: { vectors: details },
    },
  };
}

export const createCodeGrader = (run: CodeRunner): Grader<'code'> =>
  async (problem, answer) => (await checkCode(problem, answer, run, 'submit')).result;
