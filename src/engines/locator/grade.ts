import type { Grader } from '../../lib/contracts';

export const grade: Grader<'locator'> = () => ({ kind: 'locator', status: 'not-built' });
