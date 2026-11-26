import type { Grader } from '../../lib/contracts';

export const grade: Grader<'test-design'> = () => ({ kind: 'test-design', status: 'not-built' });
