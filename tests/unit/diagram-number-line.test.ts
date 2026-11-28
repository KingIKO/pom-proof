import { describe, expect, it } from 'vitest';
import { lineValues } from '../../src/lib/diagram-number-line';
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

  it('accepts a line with 2-value BVA only', () => {
    expect(problems({ threeValue: undefined })).toBe('');
  });

  it('accepts a partition of one value, whose two lines share it', () => {
    expect(problems({
      bands: [reject(5, 9), accept(10, 10), reject(11, 15)], segments: [{ title: 'Both edges', from: 8, to: 12 }],
    })).toBe('');
  });

  it('accepts a range that starts or ends beside a line, where 3-value BVA has no neighbour to add', () => {
    expect(problems({ bands: [reject(0, 0), accept(1, 20)], segments: [{ title: 'Lower edge', from: 0, to: 4 }] })).toBe('');
    expect(problems({ bands: [accept(1, 20), reject(21, 21)], segments: [{ title: 'Upper edge', from: 17, to: 21 }] })).toBe('');
  });

  it.each([
    ['a band gap', { bands: [reject(5, 8), accept(10, 20), reject(21, 25)] }, 'band "Accept" (10 to 20) leaves out 9. Start it at 9'],
    ['a longer band gap', { bands: [reject(5, 9), accept(10, 17), reject(21, 25)] }, 'band "Reject" (21 to 25) leaves out 18 to 20. Start it at 18'],
    ['a band overlap', { bands: [reject(5, 10), accept(10, 20), reject(21, 25)] }, 'band "Accept" (10 to 20) overlaps the band before it. Start it at 11'],
    ['a band that ends before it starts', { bands: [reject(5, 9), accept(10, 8), reject(9, 25)] }, 'band "Accept" (10 to 8) ends before it starts'],
    ['one band, with no line', { bands: [accept(5, 25)] }, 'bands'],
    ['no bands', { bands: [] }, 'bands'],
    ['a line where no rule changes', { bands: [reject(5, 9), accept(10, 15), accept(16, 20), reject(21, 25)] }, 'repeats the label before it'],
    ['one label for both kinds', { bands: [reject(5, 9), accept(10, 20), { ...accept(21, 25), label: 'Reject' }] }, 'label "Reject" is both accept and reject'],
    ['an unknown band kind', { bands: [reject(5, 9), { ...accept(10, 20), kind: 'maybe' }, reject(21, 25)] }, 'bands.1.kind'],
    ['a band edge that is not whole', { bands: [reject(5, 9.5), accept(10, 20), reject(21, 25)] }, 'bands.0.to'],
    ['values the bands already decide', { twoValue: [9, 10, 20, 21] }, 'twoValue'],
    ['a start the bands already decide', { min: 5 }, 'min'],
    ['a list of 3-value marks', { threeValue: [8, 11, 19, 22] }, 'threeValue'],
    ['3-value BVA that adds nothing', { bands: [reject(0, 0), accept(1, 1)], segments: [{ title: 'Edge', from: 0, to: 1 }] }, 'threeValue adds no value to this line. Leave it out'],
    ['more values than fit', { bands: [reject(4, 9), accept(10, 20), reject(21, 25)] }, '4 to 25 is 22 values. Draw at most 21'],
    ['a segment outside the range', { segments: [{ ...lower, from: 4, to: 9 }, lower, upper] }, 'segment "Lower edge" (4 to 9) is outside 5 to 25'],
    ['a segment of seven values', { segments: [{ ...lower, to: 13 }, upper] }, 'has 7 values. Draw at most 6'],
    ['segments that overlap', { segments: [lower, { ...lower, title: 'Again', from: 9 }, upper] }, 'segment "Again" (9 to 12) overlaps the segment before it'],
    ['a segment with no line', { segments: [lower, { title: 'Middle', from: 13, to: 17 }, upper] }, 'segment "Middle" (13 to 17) holds no line'],
    ['a line no segment holds', { segments: [lower] }, 'no segment holds the line between 20 and 21'],
    ['a segment that cuts a line in half', { segments: [{ ...lower, from: 10, to: 12 }, upper] }, 'no segment holds the line between 9 and 10'],
    ['a checked value no segment holds', { segments: [{ ...lower, from: 9 }, upper] }, 'no segment holds 8, which BVA checks'],
    ['no description', { description: undefined }, 'description'],
    ['an unknown field', { ticks: true }, 'ticks'],
  ])('rejects %s', (_name, changes, message) => {
    expect(problems({})).toBe('');
    expect(problems(changes)).toContain(message);
  });
});

describe('the values the bands decide', () => {
  const bands = [reject(5, 9), accept(10, 20), reject(21, 25)];

  it('are the ends of the drawing and the values BVA checks on the page', () => {
    expect(lineValues({ bands, threeValue: true })).toEqual({ min: 5, max: 25, two: [9, 10, 20, 21], three: [8, 11, 19, 22] });
    expect(lineValues({ bands }).three).toEqual([]);
  });

  it('name a value once when two lines share it', () => {
    expect(lineValues({ bands: [reject(5, 9), accept(10, 10), reject(11, 15)], threeValue: true })).toMatchObject({ two: [9, 10, 11], three: [8, 12] });
  });

  it('leave out a neighbour below the start of the range or above its end', () => {
    expect(lineValues({ bands: [reject(0, 0), accept(1, 20)], threeValue: true })).toMatchObject({ two: [0, 1], three: [2] });
    expect(lineValues({ bands: [accept(1, 20), reject(21, 21)], threeValue: true })).toMatchObject({ two: [20, 21], three: [19] });
  });
});
