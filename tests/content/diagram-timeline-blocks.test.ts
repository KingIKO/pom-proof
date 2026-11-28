import { describe, expect, it } from 'vitest';
import { stringify } from 'yaml';
import { database, pipeline, scope, states } from '../fixtures/timeline-blocks/figures';
import { timelineBlocksProblems } from '../support/diagram-rules-timeline-blocks';
import { scanProse } from '../support/plain-language';
import { discoverStudyPages } from '../support/study';

// The authoring rules and the plain-language scan for the timeline and blocks kinds. The rules run on
// every Study page in study.test.ts; here each one is shown to fail on a planted mistake.

type Data = Record<string, unknown>;
const figures = discoverStudyPages().flatMap(({ frontmatter }) => (Array.isArray(frontmatter.diagrams) ? frontmatter.diagrams as Data[] : []));
const waits = figures.find(({ id }) => id === 'pause-and-condition') ?? {};
const locators = figures.find(({ id }) => id === 'locator-change') ?? {};
const problems = (figure: Data) => timelineBlocksProblems(figure).join('\n');
const fast = { name: 'Fast run', mark: { label: 'App ready', at: 3 }, entries: [{ name: 'Fixed pause', spans: [{ from: 0, to: 5 }], outcome: 'Wastes time' }] };
const row = (changes: Data) => ({ lanes: [{ ...fast, entries: [{ ...fast.entries[0], ...changes }] }] });

describe('the timeline authoring rules', () => {
  it('accept the figure on the waiting page and both fixtures', () => {
    expect(waits.type, 'the timeline on the waiting page').toBe('timeline');
    for (const figure of [waits, scope, states]) expect(problems(figure)).toBe('');
  });

  it.each([
    ['a span that ends before it starts', row({ spans: [{ from: 5, to: 2 }] }), 'a span of "Fixed pause" runs from 5 to 2; end it after it starts'],
    ['a span of no length', row({ spans: [{ from: 2, to: 2 }] }), 'a span of "Fixed pause" runs from 2 to 2; end it after it starts'],
    ['a span past the last tick', row({ spans: [{ from: 0, to: 11 }] }), 'a span of "Fixed pause" runs from 0 to 11, outside 0 to 10'],
    ['a row with no span', row({ spans: [] }), 'row "Fixed pause" has no span'],
    ['a mark past the last tick', { lanes: [{ ...fast, mark: { label: 'App ready', at: 11 } }] }, 'mark "App ready" is at 11, outside 0 to 10'],
    ['a group past the last tick', { groups: [{ label: 'Draft', from: 0, to: 12 }] }, 'group "Draft" runs from 0 to 12, outside 0 to 10'],
    ['no scale', { steps: undefined }, 'a timeline needs steps or ticks'],
    ['no lanes', { lanes: [] }, 'a timeline needs a lane with a row'],
    ['a four-word row name', row({ name: 'Pause of fixed length' }), 'row "Pause of fixed length" has 4 words; write at most 3'],
    ['a four-word outcome', row({ outcome: 'Wastes a little time' }), 'outcome "Wastes a little time" has 4 words'],
    ['a four-word mark', { lanes: [{ ...fast, mark: { label: 'App is now ready', at: 3 } }] }, 'mark "App is now ready" has 4 words'],
    ['a four-word lane', { lanes: [{ ...fast, name: 'A very fast run' }] }, 'lane "A very fast run" has 4 words'],
    ['a four-word group', { groups: [{ label: 'The page shows draft', from: 0, to: 10 }] }, 'group "The page shows draft" has 4 words'],
    ['a duration in milliseconds', row({ outcome: '500 ms' }), '"500 ms" gives a duration'],
    ['a duration in a lane name', { lanes: [{ ...fast, name: '2s run' }] }, '"2s run" gives a duration'],
    ['a duration in the description', { description: 'The fixed pause lasts 30 seconds.' }, 'gives a duration'],
    ['a hyphened duration in the note', { note: 'Both runs use a 5-second pause.' }, 'gives a duration'],
  ])('report %s', (_name, changes, message) => {
    expect(problems(waits)).toBe('');
    expect(problems({ ...waits, ...changes })).toContain(message);
  });

  it.each([
    ['a four-word tick', { ticks: { name: 'Test', labels: ['1', '2', '3', 'The last one here'] } }, 'tick "The last one here" has 4 words'],
    ['a four-word tick name', { ticks: { ...scope.ticks, name: 'Number of each test' } }, 'tick name "Number of each test" has 4 words'],
    ['a span past the last labelled tick', { ticks: { name: 'Test', labels: ['1', '2', '3'] } }, 'a span of "Test" runs from 3 to 4, outside 0 to 3'],
  ])('report %s on a labelled scale', (_name, changes, message) => {
    expect(problems({ ...scope, ...changes })).toContain(message);
  });

  it('allow numbers that are not durations', () => {
    expect(problems({ ...waits, note: 'Both 2 runs use the same pause. Step 5 states nothing.' })).toBe('');
  });
});

describe('the blocks authoring rules', () => {
  const [before, after] = (locators.panels ?? []) as Array<{ name: string; tiers: Data[][]; result: string }>;
  const box = (changes: Data) => ({ tiers: [[{ title: 'Test A', ...changes }]] });

  it('accept the figure on the page object page and both fixtures', () => {
    expect(locators.type, 'the blocks on the page object page').toBe('blocks');
    for (const figure of [locators, database, pipeline]) expect(problems(figure)).toBe('');
  });

  it.each([
    ['one panel', { panels: [before] }, 'blocks need tiers, or two panels'],
    ['panels and tiers', { tiers: before?.tiers }, 'blocks need tiers, or two panels'],
    ['a panel without a result', { panels: [before, { ...after, result: undefined }] }, 'panel "Tests call one page object" needs a result'],
    ['a four-word result', { panels: [before, { ...after, result: 'Only one edit needed' }] }, 'result "Only one edit needed" has 4 words'],
    ['a link to a box the panel lacks', { panels: [{ ...before, tiers: [[{ title: 'Test 1', linkTo: { label: 'calls', target: 'sign-in' } }]] }, after] }, '"Test 1" links to "sign-in", which 0 boxes have as their id'],
    ['an id two boxes have', { panels: [before, { ...after, tiers: [...(after?.tiers ?? []), [{ id: 'sign-in', title: 'Copy' }]] }] }, '"Test 1" links to "sign-in", which 2 boxes have as their id'],
  ])('report %s', (_name, changes, message) => {
    expect(problems(locators)).toBe('');
    expect(problems({ ...locators, ...changes })).toContain(message);
  });

  it.each([
    ['a link past its neighbour', { tiers: [[{ title: 'Build', linkTo: { label: 'starts', target: 'deploy' } }, { title: 'Test' }, { id: 'deploy', title: 'Deploy' }]] }, '"Build" links to "deploy", which is not its neighbour'],
    ['a link backwards', { tiers: [[{ id: 'build', title: 'Build' }, { title: 'Test', linkTo: { label: 'starts', target: 'build' } }]] }, '"Test" links to "build", which is not its neighbour'],
    ['a link up', { tiers: [[{ id: 'build', title: 'Build' }], [{ title: 'Test', linkTo: { label: 'starts', target: 'build' } }]] }, '"Test" links to "build", which is not its neighbour'],
    ['a link across a corner', { tiers: [[{ title: 'Build', linkTo: { label: 'starts', target: 'log' } }, { title: 'Test' }], [{ title: 'Report' }, { id: 'log', title: 'Log' }]] }, '"Build" links to "log", which is not its neighbour'],
    ['a link over a row', { tiers: [[{ title: 'Build', linkTo: { label: 'starts', target: 'log' } }], [{ title: 'Test' }], [{ id: 'log', title: 'Log' }]] }, '"Build" links to "log", which is not its neighbour'],
    ['a link down into a row of boxes', { tiers: [[{ title: 'Build', linkTo: { label: 'starts', target: 'log' } }, { title: 'Test' }], [{ id: 'log', title: 'Log' }, { title: 'Report' }]] }, '"Build" links to "log", which is not its neighbour'],
    ['a link down from some of a row', { tiers: [[{ title: 'Test A', linkTo: { label: 'saves to', target: 'log' } }, { title: 'Test B' }], [{ id: 'log', title: 'Log' }]] }, '1 of 2 boxes in a row link down'],
    ['a four-word box', box({ title: 'The first browser test' }), 'box "The first browser test" has 4 words'],
    ['a four-word part', box({ parts: [{ name: 'Its own browser context' }] }), 'part "Its own browser context" has 4 words'],
    ['a four-word item', box({ parts: [{ name: 'Context', items: ['Cookies from the server'] }] }), 'item "Cookies from the server" has 4 words'],
    ['a four-word link', { tiers: [[{ title: 'Test A', linkTo: { label: 'saves its orders to', target: 'log' } }, { id: 'log', title: 'Log' }]] }, 'link "saves its orders to" has 4 words'],
  ])('report %s', (_name, changes, message) => {
    expect(problems(database)).toBe('');
    expect(problems({ ...database, ...changes })).toContain(message);
  });
});

describe('the plain-language scan', () => {
  /** Where each text of a figure sits; ids, types and link targets are not text. */
  const textPaths = (value: unknown, path: Array<string | number> = []): Array<Array<string | number>> => {
    if (typeof value === 'string') return [path];
    if (Array.isArray(value)) return value.flatMap((item, index) => textPaths(item, [...path, index]));
    if (value && typeof value === 'object') {
      return Object.entries(value).filter(([key]) => !['id', 'type', 'target'].includes(key)).flatMap(([key, item]) => textPaths(item, [...path, key]));
    }
    return [];
  };
  const withText = (figure: Data, path: Array<string | number>, text: string) => {
    const copy = structuredClone(figure);
    const holder = path.slice(0, -1).reduce<unknown>((at, key) => (at as Record<string | number, unknown>)[key], copy) as Record<string | number, unknown>;
    holder[path.at(-1)!] = text;
    return copy;
  };
  const scan = (figure: Data) => scanProse('content/study/test-design/planted.md', `---\n${stringify({ diagrams: [figure] })}---\n## What it is\n`)
    .findings.map(({ rule }) => rule);

  it.each([['time scale', waits], ['labelled scale', scope], ['time scale with groups', states], ['before and after', locators], ['shared box', database], ['arrow row', pipeline]])(
    'reads every text of a figure with a %s', (_name, figure) => {
      const paths = textPaths(figure);
      expect(paths.length, 'texts in the figure').toBeGreaterThan(5);
      expect(scan(figure)).toEqual([]);
      const skipped = paths.filter((path) => !scan(withText(figure, path, 'One part; another part.')).includes('semicolon'));
      expect(skipped.map((path) => path.join('.')), 'texts the scan skips').toEqual([]);
    });
});