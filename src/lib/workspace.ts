import { useEffect } from 'preact/hooks';
import type { Answer, GradeResult, Grader, Kind, Problem } from './contracts';
import { createProgressStore, notifyProgressChange } from './progress';

function matchesKind<K extends Kind>(answer: Answer, kind: K): answer is Answer<K> {
  return answer.kind === kind;
}

export function useGradeHook<K extends Kind>(problem: Problem<K>, grade: Grader<K>): void {
  useEffect(() => {
    const hook: NonNullable<Window['__pomproof']> = {
      async grade(answer) {
        if (!matchesKind(answer, problem.kind)) {
          return {
            kind: problem.kind,
            status: 'invalid-answer',
            message: 'Answer kind does not match the problem',
          };
        }
        return grade(problem, answer);
      },
    };
    window.__pomproof = hook;
    return () => {
      if (window.__pomproof === hook) delete window.__pomproof;
    };
  }, [problem, grade]);
}

export function recordResult(problemId: string, result: GradeResult): void {
  if (result.status !== 'graded') return;
  try {
    createProgressStore(window.localStorage).record({
      problemId,
      completedAt: new Date().toISOString(),
      score: result.score,
    });
    notifyProgressChange();
  } catch (error) {
    console.warn('Progress could not be saved', error);
  }
}
