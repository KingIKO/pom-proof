import { describe, expect, it } from 'vitest';
import { blocks, linkDirection, partsAcross } from '../../src/lib/diagram-blocks';
import { diagramSchema } from '../../src/lib/diagram-schema';
import { database, pipeline } from '../fixtures/timeline-blocks/figures';
import { discoverStudyPages } from '../support/study';

// Blocks whose data does not hold together fail the build: the collection schema rejects them.

type Data = Record<string, unknown>;
const locators = discoverStudyPages().flatMap(({ frontmatter }) => (Array.isArray(frontmatter.diagrams) ? frontmatter.diagrams as Data[] : []))
  .find(({ id }) => id === 'locator-change') ?? {};
const problems = (figure: Data) => {
  const result = diagramSchema.safeParse(figure);
  return result.success ? '' : result.error.issues.map(({ path, message }) => `${path.join('.')} ${message}`.trim()).join('\n');
};
const [before, after] = (locators.panels ?? []) as Array<{ name: string; tiers: Data[][]; result: string }>;
const link = (target: string) => ({ label: 'starts', target });
const single = (...tiers: Data[][]) => ({ tiers, panels: undefined });

describe('the blocks schema', () => {
  it('accepts the figure on the page object page and both fixtures', () => {
    expect(locators.type, 'the blocks on the page object page').toBe('blocks');
    for (const figure of [locators, database, pipeline]) expect(problems(figure)).toBe('');
  });

  it.each([
    ['one panel', { panels: [before] }, 'panels'],
    ['three panels', { panels: [before, after, after] }, 'panels'],
    ['panels and tiers', { tiers: before?.tiers }, 'give tiers for one drawing, or two panels for before and after'],
    ['neither panels nor tiers', { panels: undefined }, 'give tiers for one drawing, or two panels for before and after'],
    ['a panel without a result', { panels: [before, { ...after, result: undefined }] }, 'panels.1.result'],
    ['a panel without a name', { panels: [{ ...before, name: undefined }, after] }, 'panels.0.name'],
    ['a link to a box in the other panel', { panels: [{ ...before, tiers: [[{ title: 'Test 1', linkTo: { label: 'calls', target: 'sign-in' } }]] }, after] }, 'panels.0.tiers.0.0.linkTo "Test 1" links to "sign-in", which is not a box in this drawing'],
    ['a link to a missing box', single([{ title: 'Build', linkTo: link('tset') }, { id: 'test', title: 'Test' }]), '"Build" links to "tset", which is not a box in this drawing'],
    ['a link past its neighbour', single([{ title: 'Build', linkTo: link('deploy') }, { title: 'Test' }, { id: 'deploy', title: 'Deploy' }]), '"Build" links to "deploy", which is not the next box in its row or the one box of the row below'],
    ['a link backwards', single([{ id: 'build', title: 'Build' }, { title: 'Test', linkTo: link('build') }]), '"Test" links to "build", which is not the next box'],
    ['a link to itself', single([{ id: 'build', title: 'Build', linkTo: link('build') }]), '"Build" links to "build", which is not the next box'],
    ['a link up', single([{ id: 'build', title: 'Build' }], [{ title: 'Test', linkTo: link('build') }]), '"Test" links to "build", which is not the next box'],
    ['a link across a corner', single([{ title: 'Build', linkTo: link('log') }, { title: 'Test' }], [{ title: 'Report' }, { id: 'log', title: 'Log' }]), '"Build" links to "log", which is not the next box'],
    ['a link over a row', single([{ title: 'Build', linkTo: link('log') }], [{ title: 'Test' }], [{ id: 'log', title: 'Log' }]), '"Build" links to "log", which is not the next box'],
    ['a link down into a row of boxes', single([{ title: 'Build', linkTo: link('log') }, { title: 'Test' }], [{ id: 'log', title: 'Log' }, { title: 'Report' }]), '"Build" links to "log", which is not the next box in its row or the one box of the row below'],
    ['a link down from the first box only', single([{ title: 'Test A', linkTo: link('log') }, { title: 'Test B' }], [{ id: 'log', title: 'Log' }]), 'tiers.0 link down from every box of a row, or only from its last one'],
    ['a link down from two boxes of three', single([{ title: 'Test A' }, { title: 'Test B', linkTo: link('log') }, { title: 'Test C', linkTo: link('log') }], [{ id: 'log', title: 'Log' }]), 'tiers.0 link down from every box'],
    ['a link without a label', single([{ title: 'Build', linkTo: { target: 'test' } }, { id: 'test', title: 'Test' }]), 'linkTo.label'],
    ['a repeated id', single([{ id: 'test', title: 'Test 1' }, { id: 'test', title: 'Test 2' }]), 'two boxes have the id "test"'],
    ['four boxes in a row', single([{ title: 'A' }, { title: 'B' }, { title: 'C' }, { title: 'D' }]), 'tiers.0'],
    ['an empty row', single([]), 'tiers.0'],
    ['a box with no title', single([{ parts: [{ name: 'Context' }] }]), 'tiers.0.0.title'],
    ['a box inside a box', single([{ title: 'Suite', boxes: [{ title: 'Test' }] }]), 'tiers.0.0'],
    ['a part inside a part', single([{ title: 'Suite', parts: [{ name: 'Test', parts: [{ name: 'Step' }] }] }]), 'tiers.0.0.parts.0'],
    ['a box with an empty list of parts', single([{ title: 'Suite', parts: [] }]), 'tiers.0.0.parts'],
    ['strong boxes and strong parts', single([{ title: 'Suite', strong: true, parts: [{ name: 'Test', strong: true }] }]), 'make one kind of thing strong in a figure, boxes or parts'],
    ['no description', { description: undefined }, 'description'],
    ['an unknown field', { arrows: [] }, 'arrows'],
  ])('rejects %s', (_name, changes, message) => {
    expect(problems(locators)).toBe('');
    expect(problems({ ...locators, ...changes })).toContain(message);
  });
});

describe('the blocks layout', () => {
  const directions = (figure: Data) => {
    const { tiers = [] } = blocks.parse(figure);
    return tiers.map((row, tier) => row.map((_box, column) => linkDirection(tiers, tier, column)));
  };

  it('points an arrow across to the next box or down to the one below', () => {
    expect(directions(database)).toEqual([['down', 'down'], [undefined]]);
    expect(directions(pipeline)).toEqual([['across', 'across', 'down'], [undefined]]);
  });

  it('lays two or three parts side by side in a box with its row to itself', () => {
    expect([1, 2, 3, 4].map((count) => partsAcross(count, true))).toEqual([1, 2, 3, 1]);
    expect([1, 2, 3].map((count) => partsAcross(count, false))).toEqual([1, 1, 1]);
  });
});