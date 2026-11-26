import { useEffect } from 'preact/hooks';
import type { Answer, Grader, Kind, Problem } from '../lib/contracts';

function matchesKind<K extends Kind>(answer: Answer, kind: K): answer is Answer<K> {
  return answer.kind === kind;
}

export default function StubWorkspace<K extends Kind>({
  problem, engine, grade,
}: { problem: Problem<K>; engine: string; grade: Grader<K> }) {
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

  return <p data-engine={engine} data-testid="engine-stub">Not built yet</p>;
}
