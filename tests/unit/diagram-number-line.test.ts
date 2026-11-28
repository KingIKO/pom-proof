import { describe, expect, it } from 'vitest';
import { diagramSchema } from '../../src/lib/diagram-schema';
import { discoverStudyPages } from '../support/study';

// A number line whose data does not hold together fails the build: the collection schema rejects it.

const page = discoverStudyPages().find(({ id }) => id === 'test-design/equivalence-and-boundaries');
const line = (page?.frontmatter.diagrams as Array<Record<string, unknown>> | undefined)?.find(({ type }) => type === 'number-line');

const problems = (changes: Record<string, unknown>) => {
  const result = diagramSchema.safeParse({ ...line, ...changes });
  return result.success ? '' : result.error.issues.map(({ path, message }) => `${path.join('.')} ${message}`.trim()).join('\n');
};
const reject = (from: number, to: number) => ({ from, to, label: 'Reject', kind: 'reject' });
const accept = (from: number, to: number) => ({ from, to, label: 'Accept', kind: 'accept' });
const lower = { title: 'Lower edge', from: 7, to: 12 };
const upper = { title: 'Upper edge', from: 18, to: 23 };

describe('the number line schema', () => {
  it('accepts the figure on the equivalence and boundaries page', () => {
    expect(line, 'the number line on the equivalence and boundaries page').toBeDefined();
    expect(problems({})).toBe('');
  });

  it('accepts a line with 2-value marks only', () => {
    expect(problems({ threeValue: undefined })).toBe('');
  });

  it('accepts a partition of one value, whose two lines share it', () => {
    expect(problems({
      min: 5, max: 15, bands: [reject(5, 9), accept(10, 10), reject(11, 15)],
      twoValue: [9, 10, 11], threeValue: [8, 12], segments: [{ title: 'Both edges', from: 8, to: 12 }],
    })).toBe('');
  });

  it.each([
    ['a band gap', { bands: [reject(5, 8), accept(10, 20), reject(21, 25)] }, 'band "Accept" (10 to 20) leaves out 9. Start it at 9'],
    ['a longer band gap', { bands: [reject(5, 9), accept(10, 17), reject(21, 25)] }, 'band "Reject" (21 to 25) leaves out 18 to 20. Start it at 18'],
    ['a band overlap', { bands: [reject(5, 10), accept(10, 20), reject(21, 25)] }, 'band "Accept" (10 to 20) overlaps the band before it. Start it at 11'],
    ['a band that ends before it starts', { bands: [reject(5, 9), accept(10, 8), reject(9, 25)] }, 'band "Accept" (10 to 8) ends before it starts'],
    ['bands that start below min', { bands: [reject(4, 9), accept(10, 20), reject(21, 25)] }, 'band "Reject" (4 to 9) starts below min 5'],
    ['bands that start above min', { bands: [reject(7, 9), accept(10, 20), reject(21, 25)] }, 'leaves out 5 to 6. Start it at 5'],
    ['bands that stop before max', { bands: [reject(5, 9), accept(10, 20), reject(21, 24)] }, 'the last band ends at 24. End it at max 25'],
    ['bands that run past max', { bands: [reject(5, 9), accept(10, 20), reject(21, 26)] }, 'the last band ends at 26. End it at max 25'],
    ['one band, with no line', { bands: [accept(5, 25)] }, 'bands'],
    ['a line where no rule changes', { bands: [reject(5, 9), accept(10, 15), accept(16, 20), reject(21, 25)] }, 'repeats the label before it'],
    ['one label for both kinds', { bands: [reject(5, 9), accept(10, 20), { ...accept(21, 25), label: 'Reject' }] }, 'label "Reject" is both accept and reject'],
    ['an unknown band kind', { bands: [reject(5, 9), { ...accept(10, 20), kind: 'maybe' }, reject(21, 25)] }, 'bands.1.kind'],
    ['a mark above the range', { twoValue: [9, 10, 20, 21, 26] }, 'mark 26 is outside 5 to 25'],
    ['a mark below the range', { threeValue: [4, 8, 11, 19, 22] }, 'mark 4 is outside 5 to 25'],
    ['a mark that is not whole', { twoValue: [9.5, 10, 20, 21] }, 'twoValue.0'],
    ['a mark listed twice', { twoValue: [9, 10, 10, 20, 21] }, 'mark 10 is listed twice'],
    ['a mark in both lists', { threeValue: [8, 9, 11, 19, 22] }, 'mark 9 is listed twice'],
    ['a 2-value mark away from the lines', { twoValue: [9, 10, 15, 20, 21] }, 'The values beside the lines are 9, 10, 20, 21'],
    ['a missing 2-value mark', { twoValue: [9, 10, 20] }, 'twoValue is 9, 10, 20. The values beside the lines are 9, 10, 20, 21'],
    ['a missing 3-value mark', { threeValue: [8, 11, 19] }, 'The values next to 9, 10, 20, 21 are 8, 11, 19, 22'],
    ['a range that runs backwards', { min: 25, max: 5 }, 'min 25 must be below max 5'],
    ['more values than fit', { min: 4, bands: [reject(4, 9), accept(10, 20), reject(21, 25)] }, '4 to 25 is 22 values. Draw at most 21'],
    ['a segment outside the range', { segments: [{ ...lower, from: 4, to: 9 }, lower, upper] }, 'segment "Lower edge" (4 to 9) is outside 5 to 25'],
    ['a segment of seven values', { segments: [{ ...lower, to: 13 }, upper] }, 'has 7 values. Draw at most 6'],
    ['segments that overlap', { segments: [lower, { ...lower, title: 'Again', from: 9 }, upper] }, 'segment "Again" (9 to 12) overlaps the segment before it'],
    ['a segment with no line', { segments: [lower, { title: 'Middle', from: 13, to: 17 }, upper] }, 'segment "Middle" (13 to 17) holds no line'],
    ['a line no segment holds', { segments: [lower] }, 'no segment holds the line between 20 and 21'],
    ['a segment that cuts a line in half', { segments: [{ ...lower, from: 10, to: 12 }, upper] }, 'no segment holds the line between 9 and 10'],
    ['a mark no segment holds', { segments: [{ ...lower, from: 9 }, upper] }, 'no segment holds mark 8'],
    ['no description', { description: undefined }, 'description'],
    ['an unknown field', { ticks: true }, 'ticks'],
  ])('rejects %s', (_name, changes, message) => {
    expect(problems({})).toBe('');
    expect(problems(changes)).toContain(message);
  });
});
