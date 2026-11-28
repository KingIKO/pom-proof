import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { doubles, risk } from '../fixtures/diagrams/matrices';
import { kindProblems } from '../support/diagram-rules';
import { scanProse } from '../support/plain-language';
import { discoverStudyPages } from '../support/study';

// The authoring rules and the plain-language scan for the number line and matrix kinds. The rules run on
// every Study page in study.test.ts; here each one is shown to fail on a planted mistake.

type Data = Record<string, unknown>;
const page = discoverStudyPages().find(({ id }) => id === 'test-design/equivalence-and-boundaries');
const line = (page?.frontmatter.diagrams as Data[] | undefined)?.find(({ type }) => type === 'number-line') ?? {};
const problems = (figure: Data, body = page?.body ?? '') => kindProblems(figure, body).join('\n');

describe('the number line authoring rules', () => {
  it('accept the figure on the equivalence and boundaries page', () => {
    expect(line.type, 'the number line on the equivalence and boundaries page').toBe('number-line');
    expect(problems(line)).toBe('');
  });

  it.each([
    ['a band label of two words', { bands: [{ from: 5, to: 9, label: 'Not accepted', kind: 'reject' }] }, 'band label "Not accepted" has 2 words; write at most 1'],
    ['a band label the page does not use', { bands: [{ from: 5, to: 9, label: 'Refuse', kind: 'reject' }] }, 'band label "Refuse" is not a word in the body'],
    ['a checked value the page does not give', { twoValue: [9, 10, 20, 24] }, 'checked value 24 is not in the body'],
    ['a four-word segment title', { segments: [{ title: 'Around the lower edge', from: 7, to: 12 }] }, 'segment title "Around the lower edge" has 4 words; write at most 3'],
  ])('report %s', (_name, changes, message) => {
    expect(problems({ ...line, ...changes })).toContain(message);
  });

  it('report values the page stops giving', () => {
    const body = page!.body.replace('That adds 8, 11, 19 and 22.', '');
    expect(body, 'the sentence was cut').not.toBe(page!.body);
    expect(problems(line, body)).toContain('checked value 8 is not in the body');
  });
});

describe('the matrix authoring rules', () => {
  it('accept both fixture figures', () => {
    expect(problems(risk)).toBe('');
    expect(problems(doubles)).toBe('');
  });

  it.each([
    ['a six-word question', doubles, { columns: ['Returns the answers you prepared earlier'] }, 'question "Returns the answers you prepared earlier" has 6 words; write at most 5'],
    ['a four-word level column', risk, { columns: ['Low to medium impact'] }, 'column "Low to medium impact" has 4 words; write at most 3'],
    ['a four-word row', risk, { entries: [{ head: 'Very high likelihood indeed', cells: [] }] }, 'row "Very high likelihood indeed" has 4 words; write at most 3'],
    ['a four-word axis name', risk, { rowAxis: 'How likely it is' }, 'axis name "How likely it is" has 4 words; write at most 3'],
    ['a four-word placed item', risk, { placed: [{ label: 'Customer is charged twice', row: 'Medium', column: 'High' }] }, 'placed item "Customer is charged twice" has 4 words; write at most 3'],
  ])('report %s', (_name, figure, changes, message) => {
    expect(problems({ ...figure, ...changes })).toContain(message);
  });
});

describe('the plain-language scan', () => {
  /** Where each text of a figure sits; ids and the type and kind switches are not text. */
  const textPaths = (value: unknown, path: Array<string | number> = []): Array<Array<string | number>> => {
    if (typeof value === 'string') return [path];
    if (Array.isArray(value)) return value.flatMap((item, index) => textPaths(item, [...path, index]));
    if (value && typeof value === 'object') {
      return Object.entries(value).filter(([key]) => !['id', 'type', 'kind'].includes(key)).flatMap(([key, item]) => textPaths(item, [...path, key]));
    }
    return [];
  };
  const withText = (figure: Data, path: Array<string | number>, text: string) => {
    const copy = structuredClone(figure);
    const last = path.at(-1)!;
    const holder = path.slice(0, -1).reduce<unknown>((at, key) => (at as Record<string | number, unknown>)[key], copy) as Record<string | number, unknown>;
    holder[last] = text;
    return copy;
  };
  const scan = (figure: Data) => scanProse('content/study/test-design/planted.md', `---\n${stringify({ diagrams: [figure] })}---\n## What it is\n`)
    .findings.map(({ rule }) => rule);

  it.each([['number line', line], ['levels matrix', risk], ['answers matrix', doubles]])('reads every text of a %s', (_name, figure) => {
    const paths = textPaths(figure);
    expect(paths.length, 'texts in the figure').toBeGreaterThan(5);
    expect(scan(figure)).toEqual([]);
    const skipped = paths.filter((path) => !scan(withText(figure, path, 'One part; another part.')).includes('semicolon'));
    expect(skipped.map((path) => path.join('.')), 'texts the scan skips').toEqual([]);
  });

  it('would skip a matrix whose rows were keyed rows, so the key is entries', () => {
    const { entries, ...rest } = risk;
    expect(scan({ ...rest, rows: [{ head: 'One part; another part.' }, ...entries] })).toEqual([]);
  });
});
