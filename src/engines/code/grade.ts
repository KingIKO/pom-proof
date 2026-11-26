import type { Answer, GradeResult, Grader, Problem } from '../../lib/contracts';
import type { CodeCheck, CodeRunner } from '../../runners/code-evaluate';
import { runPython } from '../../runners/python-browser';
import type { PythonRunner } from '../../runners/python-contract';

const visibleCount = (problem: Problem<'code'>) => Math.ceil(problem.vectors.length / 2);

export async function checkCode(
  problem: Problem<'code'>,
  answer: Answer<'code'>,
  run: CodeRunner,
  mode: 'run' | 'submit',
  runPythonAnswer: PythonRunner = runPython,
): Promise<{ result: GradeResult<'code'>; checks?: CodeCheck[] }> {
  const invalid = (message: string) => ({ result: { kind: 'code', status: 'invalid-answer', message } } as const);
  const language = answer.value?.language;
  const source = answer.value?.source;
  if (language !== 'ts' && language !== 'js' && language !== 'python') {
    return invalid('Choose JavaScript, TypeScript, or Python.');
  }
  if (typeof source !== 'string' || !source.trim()) return invalid('Enter a solution to run the checks.');

  const visible = visibleCount(problem);
  const vectors = mode === 'run' ? problem.vectors.slice(0, visible) : problem.vectors;
  let reply;
  try {
    const request = {
      source, exportName: problem.exportName,
      allowInputMutation: problem.allowInputMutation,
      vectors: vectors.map(({ args, expected }, index) => ({ args, expected, visible: index < visible })),
    };
    reply = language === 'python' ? await runPythonAnswer(request) : await run({ ...request, language });
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

export const createCodeGrader = (run: CodeRunner, runPythonAnswer?: PythonRunner): Grader<'code'> =>
  async (problem, answer) => (await checkCode(problem, answer, run, 'submit', runPythonAnswer)).result;
