import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { doubles, risk } from '../fixtures/diagrams/matrices';
import { database, pipeline, scope, states } from '../fixtures/timeline-blocks/figures';
import { kindProblems } from '../support/diagram-rules';
import { scanProse } from '../support/plain-language';
import { discoverStudyPages } from '../support/study';

// The authoring rules and the plain-language scan for each diagram kind that has its own rules. The
// rules run on every Study page in study.test.ts; here each one is shown to fail on a planted mistake.

type Data = Record<string, unknown>;
const pages = discoverStudyPages();
const page = pages.find(({ id }) => id === 'test-design/equivalence-and-boundaries');
/** A figure on a Study page, by its id. */
const figureOf = (figureId: string) => pages.flatMap(({ frontmatter }) => (Array.isArray(frontmatter.diagrams) ? frontmatter.diagrams as Data[] : []))
  .find(({ id }) => id === figureId) ?? {};
const line = figureOf('boundary-values');
const waits = figureOf('pause-and-condition');
const locators = figureOf('locator-change');
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

describe('the timeline authoring rules', () => {
  const lane = { name: 'Fast run', mark: { label: 'App ready', at: 3 }, entries: [{ name: 'Fixed pause', spans: [{ from: 0, to: 5 }], outcome: 'Wastes time' }] };
  const lanes = (changes: Data) => ({ lanes: [{ ...lane, ...changes }] });
  const row = (changes: Data) => lanes({ entries: [{ ...lane.entries[0], ...changes }] });

  it('accept the figure on the waiting page and both fixtures', () => {
    expect(waits.type, 'the timeline on the waiting page').toBe('timeline');
    for (const figure of [waits, scope, states]) expect(problems(figure)).toBe('');
  });

  it.each([
    ['a four-word row name', row({ name: 'Pause of fixed length' }), 'row "Pause of fixed length" has 4 words; write at most 3'],
    ['a four-word outcome', row({ outcome: 'Wastes a little time' }), 'outcome "Wastes a little time" has 4 words'],
    ['a four-word mark', lanes({ mark: { label: 'App is now ready', at: 3 } }), 'mark "App is now ready" has 4 words'],
    ['a four-word lane', lanes({ name: 'A very fast run' }), 'lane "A very fast run" has 4 words'],
    ['a four-word group', { groups: [{ label: 'The page shows draft', from: 0, to: 10 }] }, 'group "The page shows draft" has 4 words'],
    ['a four-word tick', { ticks: { name: 'Test', labels: ['1', '2', '3', 'The last one here'] } }, 'tick "The last one here" has 4 words'],
    ['a four-word tick name', { ticks: { name: 'Number of each test', labels: ['1', '2'] } }, 'tick name "Number of each test" has 4 words'],
    ['a duration in milliseconds', row({ outcome: '500 ms' }), '"500 ms" gives a duration'],
    ['a duration in a lane name', lanes({ name: '2s run' }), '"2s run" gives a duration'],
    ['a duration in the description', { description: 'The fixed pause lasts 30 seconds.' }, 'gives a duration'],
    ['a hyphened duration in the note', { note: 'Both runs use a 5-second pause.' }, 'gives a duration'],
  ])('report %s', (_name, changes, message) => {
    expect(problems(waits)).toBe('');
    expect(problems({ ...waits, ...changes })).toContain(message);
  });

  it('allow numbers that are not durations', () => {
    expect(problems({ ...waits, note: 'Both 2 runs use the same pause. Step 5 states nothing.' })).toBe('');
  });
});

describe('the blocks authoring rules', () => {
  const box = (changes: Data) => ({ tiers: [[{ title: 'Test A', ...changes }]] });

  it('accept the figure on the page object page and both fixtures', () => {
    expect(locators.type, 'the blocks on the page object page').toBe('blocks');
    for (const figure of [locators, database, pipeline]) expect(problems(figure)).toBe('');
  });

  it.each([
    ['a four-word box', box({ title: 'The first browser test' }), 'box "The first browser test" has 4 words; write at most 3'],
    ['a four-word part', box({ parts: [{ name: 'Its own browser context' }] }), 'part "Its own browser context" has 4 words'],
    ['a four-word item', box({ parts: [{ name: 'Context', items: ['Cookies from the server'] }] }), 'item "Cookies from the server" has 4 words'],
    ['a four-word link', box({ linkTo: { label: 'saves its orders to', target: 'log' } }), 'link "saves its orders to" has 4 words'],
    ['a four-word box in a panel', { panels: [{ name: 'Before', tiers: [[{ title: 'The first browser test' }]], result: '3 edits' }] }, 'box "The first browser test" has 4 words'],
    ['a four-word result', { panels: [{ name: 'Before', tiers: [], result: 'Only one edit needed' }] }, 'result "Only one edit needed" has 4 words'],
  ])('report %s', (_name, changes, message) => {
    expect(problems(database)).toBe('');
    expect(problems({ ...database, ...changes })).toContain(message);
  });

  it('leave a closing letter or number out of the count', () => {
    for (const title of ['Order for Test A', 'Order for Test 12']) expect(problems({ ...database, ...box({ title }) })).toBe('');
    expect(problems({ ...database, ...box({ title: 'Order for this Test A' }) })).toContain('box "Order for this Test A" has 4 words');
  });
});

describe('the plain-language scan', () => {
  /** Where each text of a figure sits; ids, link targets and the type and kind switches are not text. */
  const textPaths = (value: unknown, path: Array<string | number> = []): Array<Array<string | number>> => {
    if (typeof value === 'string') return [path];
    if (Array.isArray(value)) return value.flatMap((item, index) => textPaths(item, [...path, index]));
    if (value && typeof value === 'object') {
      return Object.entries(value).filter(([key]) => !['id', 'type', 'kind', 'target'].includes(key)).flatMap(([key, item]) => textPaths(item, [...path, key]));
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

  it.each([
    ['number line', line], ['levels matrix', risk], ['answers matrix', doubles],
    ['timeline', waits], ['timeline with ticks', scope], ['timeline with groups', states],
    ['before and after pair of blocks', locators], ['blocks drawing', database], ['row of linked blocks', pipeline],
  ] as Array<[string, Data]>)('reads every text of a %s', (_name, figure) => {
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
