import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'retry-delay-schedule',
  title: 'Build a capped retry schedule',
  kind: 'coding',
  difficulty: 'Medium',
  topics: ['Arrays', 'Retries', 'Boundary values'],
  roles: ['automation', 'sdet'],
  summary: 'Generate wait times for retries without sleeping or using a clock.',
  prompt: `
Write \`retryDelaySchedule(baseMs, capMs, retries)\` to return one wait in milliseconds for each retry. The initial attempt contributes no entry.

The first retry waits \`baseMs\`. Each later wait doubles the previous one. Cap each wait at \`capMs\`, including the first, and keep emitting capped waits until there are \`retries\` entries. The waits are delays between attempts, not timestamps.

Both wait inputs are positive integers no larger than 1,000,000,000. The retry count is a nonnegative integer.

\`retryDelaySchedule(100, 250, 5)\` returns \`[100, 200, 250, 250, 250]\`.
`,
  fn: 'retryDelaySchedule',
  params: [{ name: 'baseMs', type: 'number' }, { name: 'capMs', type: 'number' }, { name: 'retries', type: 'number' }],
  returns: 'number[]',
  cases: [
    { args: [100, 250, 5], expected: [100,200,250,250,250] },
    { args: [4, 100, 3], expected: [4,8,16] },
    { args: [20, 10, 4], expected: [10,10,10,10] },
    { args: [1, 1, 0], expected: [], hidden: true },
    { args: [99, 100, 1], expected: [99], hidden: true },
    { args: [5, 20, 5], expected: [5,10,20,20,20], hidden: true },
    { args: [700000000, 1000000000, 4], expected: [700000000,1000000000,1000000000,1000000000], hidden: true },
  ],
  hints: ['Keep the current wait as a running variable.', 'Apply the cap before adding a wait to the schedule.'],
  reference: {
    javascript: `function retryDelaySchedule(baseMs, capMs, retries) {
  let wait = Math.min(baseMs, capMs);
  const delays = [];
  for (let i = 0; i < retries; i++) {
    delays.push(wait);
    wait = Math.min(wait * 2, capMs);
  }
  return delays;
}`,
    python: `def retry_delay_schedule(baseMs, capMs, retries):
    wait = min(baseMs, capMs)
    delays = []
    for _ in range(retries):
        delays.append(wait)
        wait = min(wait * 2, capMs)
    return delays`,
  },
  solutionNotes: 'Use a recurrence instead of raising two to the retry number. Once a delay reaches the cap, the same expression keeps it there. Runtime is proportional to the returned array.',
  interviewNotes: 'Distinguish retries from attempts and delays from elapsed time. How would you check a version that adds random jitter without relying on a real clock?',
};

export default item;
