import type { Grader, Kind, Problem } from '../lib/contracts';
import { useGradeHook } from '../lib/workspace';

export default function StubWorkspace<K extends Kind>({
  problem, engine, grade,
}: { problem: Problem<K>; engine: string; grade: Grader<K> }) {
  useGradeHook(problem, grade);

  return <p data-engine={engine} data-testid="engine-stub">Not built yet</p>;
}
