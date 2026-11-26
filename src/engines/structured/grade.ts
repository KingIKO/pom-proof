import type { Grader, StructuredKind } from '../../lib/contracts';

export const grade: Grader<StructuredKind> = (problem) => ({
  kind: problem.kind,
  status: 'not-built',
});
