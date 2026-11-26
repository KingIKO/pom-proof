import type { MutationItem } from '../../types';

const implementation = `function reservationOverlap(first, second) {
  function valid({ start, end }) {
    return Number.isInteger(start) && Number.isInteger(end) &&
      start >= 0 && end <= 1440 && start < end;
  }
  if (!valid(first) || !valid(second)) return null;
  if (first.room !== second.room) return 0;
  const start = Math.max(first.start, second.start);
  const end = Math.min(first.end, second.end);
  return Math.max(0, end - start);
}`;

const item: MutationItem = {
  id: 'reservation-range-overlap',
  title: 'Test the overlap between reservations',
  kind: 'mutation',
  subject: 'function',
  difficulty: 'Easy',
  topics: ['Intervals', 'Boundary values', 'Mutation testing'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Check whether two bookings conflict and for how long.',
  prompt: 'Write tests for the reservation checker. All tests must pass on the real checker, and each planted bug must fail at least one test for a full mutation score.',
  contract: `
\`reservationOverlap(first, second)\` receives two objects with a case-sensitive string \`room\` and numeric \`start\` and \`end\` minutes, both measured from the same midnight.

- A booking is valid when both times are integers and \`0 <= start < end <= 1440\`. If either booking is invalid, return \`null\`, even if the rooms differ.
- Two valid bookings in different rooms have zero overlap.
- In the same room, return the number of minutes shared by the two half-open intervals \`[start, end)\`. Touching at a checkout minute gives zero. Disjoint intervals also give zero.
`,
  implementation,
  mutants: [
    { id: 'excluding-midnight', label: 'A reservation that starts at midnight is rejected.', code: implementation.replace('start >= 0', 'start > 0') },
    { id: 'excluding-day-end', label: 'A reservation that ends at the next midnight is rejected.', code: implementation.replace('end <= 1440', 'end < 1440') },
    { id: 'zero-length', label: 'A reservation with equal start and end passes validation.', code: implementation.replace('start < end', 'start <= end') },
    { id: 'room-ignored', label: 'Reservations in different rooms can report an overlap.', code: implementation.replace('  if (first.room !== second.room) return 0;\n', '') },
    { id: 'inclusive-end', label: 'A shared end minute counts as part of the overlap.', code: implementation.replace('end - start);', 'end - start + 1);') },
    { id: 'first-only', label: 'The second reservation is never validated.', code: implementation.replace('!valid(first) || !valid(second)', '!valid(first)') },
  ],
  starter: `test('Two separate morning bookings do not overlap', () => {
  const first = { room: 'A', start: 60, end: 120 };
  const second = { room: 'A', start: 180, end: 240 };
  expect(reservationOverlap(first, second)).toBe(0);
});

// TODO: Check what happens at the endpoints of a booking.
// TODO: Exercise invalid bookings and room identity.`,
  referenceTests: `test('A partial overlap is the same in either argument order', () => {
  const a = { room: 'A', start: 100, end: 200 };
  const b = { room: 'A', start: 180, end: 220 };
  expect(reservationOverlap(a, b)).toBe(20);
  expect(reservationOverlap(b, a)).toBe(20);
});

test('Bookings may begin at midnight or end at midnight the next day', () => {
  expect(reservationOverlap({ room: 'A', start: 0, end: 30 }, { room: 'A', start: 20, end: 50 })).toBe(10);
  expect(reservationOverlap({ room: 'A', start: 1400, end: 1440 }, { room: 'A', start: 1420, end: 1430 })).toBe(10);
});

test('A zero-length first booking is invalid', () => {
  expect(reservationOverlap({ room: 'A', start: 15, end: 15 }, { room: 'A', start: 10, end: 20 })).toBeNull();
});

test('Room comparison is exact even for identical times', () => {
  expect(reservationOverlap({ room: 'A', start: 10, end: 20 }, { room: 'a', start: 10, end: 20 })).toBe(0);
});

test('Touching bookings do not share a minute', () => {
  expect(reservationOverlap({ room: 'A', start: 10, end: 20 }, { room: 'A', start: 20, end: 30 })).toBe(0);
});

test('Validate the second booking even if it is in another room', () => {
  expect(reservationOverlap({ room: 'A', start: 10, end: 20 }, { room: 'B', start: 15, end: 1441 })).toBeNull();
});`,
  solutionNotes: 'A timeline helps separate touching, partial overlap, and containment. Keep valid-range tests separate from overlap math, and put invalid input in each argument position.',
  interviewNotes: 'Explain whether the end minute is available to another booking. How would the test design change if reservations could span midnight?',
};

export default item;
