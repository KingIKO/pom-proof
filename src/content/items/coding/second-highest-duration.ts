import type { CodingItem } from '../../types';

const item: CodingItem = {
  id: 'second-highest-duration',
  title: 'Find the second-highest test duration',
  kind: 'coding',
  difficulty: 'Easy',
  topics: ['Arrays', 'Ranking'],
  roles: ['automation', 'sdet'],
  summary: 'Find the next distinct time after the slowest test.',
  prompt: `
Write \`secondHighestDuration(durations)\`. Durations are nonnegative integer milliseconds within the safe integer range. Return the second-highest **distinct** duration, or \`null\` (Python \`None\`) if fewer than two distinct values exist.

For \`[90, 20, 90, 80]\`, return \`80\`. Keep the input array unchanged.
`,
  fn: 'secondHighestDuration',
  params: [{ name: 'durations', type: 'number[]' }],
  returns: 'number | null',
  cases: [
    { args: [[90, 20, 90, 80]], expected: 80 },
    { args: [[40, 40, 40]], expected: null },
    { args: [[16, 0]], expected: 0 },
    { args: [[]], expected: null, hidden: true },
    { args: [[5]], expected: null, hidden: true },
    { args: [[3, 5, 8, 13]], expected: 8, hidden: true },
    { args: [[9007199254740991, 100, 9007199254740991, 9007199254740990]], expected: 9007199254740990, hidden: true },
  ],
  hints: ['Keep the largest two distinct values seen so far.', 'When you find a new maximum, the old maximum becomes second.'],
  reference: {
    javascript: `function secondHighestDuration(durations) {
  let best = null;
  let second = null;
  for (const duration of durations) {
    if (best === null || duration > best) {
      second = best;
      best = duration;
    } else if (duration < best && (second === null || duration > second)) {
      second = duration;
    }
  }
  return second;
}`,
    python: `def second_highest_duration(durations):
    best = second = None
    for duration in durations:
        if best is None or duration > best:
            best, second = duration, best
        elif duration < best and (second is None or duration > second):
            second = duration
    return second`,
  },
  solutionNotes: 'Keep two nullable values. Equality with the maximum changes neither. This uses constant extra space and avoids mutating the array with an in-place sort.',
  interviewNotes: 'Describe the invariant for both variables after each input element. How would you test the case where the maximum arrives last?',
};

export default item;
