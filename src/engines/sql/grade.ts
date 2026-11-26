import type { Grader } from '../../lib/contracts';

export const grade: Grader<'sql'> = () => ({ kind: 'sql', status: 'not-built' });
