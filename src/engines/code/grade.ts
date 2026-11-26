import type { Grader } from '../../lib/contracts';

export const grade: Grader<'code'> = () => ({ kind: 'code', status: 'not-built' });
