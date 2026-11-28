import { describe, expect, it } from 'vitest';
import { diagramSchema } from '../../src/lib/diagram-schema';
import { gridColumn, markPlace, outcomeSpan, scaleTracks, spanText, timeline } from '../../src/lib/diagram-timeline';
import { scope, states } from '../fixtures/timeline-blocks/figures';
import { discoverStudyPages } from '../support/study';

// A timeline whose data does not hold together fails the build: the collection schema rejects it. The
// rest is the grid maths and the words a screen reader hears for each bar.

type Data = Record<string, unknown>;
const waits = discoverStudyPages().flatMap(({ frontmatter }) => (Array.isArray(frontmatter.diagrams) ? frontmatter.diagrams as Data[] : []))
  .find(({ id }) => id === 'pause-and-condition') ?? {};
const problems = (figure: Data) => {
  const result = diagramSchema.safeParse(figure);
  return result.success ? '' : result.error.issues.map(({ path, message }) => `${path.join('.')} ${message}`.trim()).join('\n');
};
const mark = { label: 'App ready', at: 3 };
const entry = { name: 'Fixed pause', spans: [{ from: 0, to: 5 }], outcome: 'Wastes time' };
const lane = { name: 'Fast run', mark, entries: [entry] };
const row = (changes: Data) => ({ lanes: [{ ...lane, entries: [{ ...entry, ...changes }] }] });

describe('the timeline schema', () => {
  it('accepts the figure on the waiting page and both fixtures', () => {
    expect(waits.type, 'the timeline on the waiting page').toBe('timeline');
    for (const figure of [waits, scope, states]) expect(problems(figure)).toBe('');
  });

  it('accepts a bar across both parallel groups, for a run on one worker', () => {
    expect(problems({ ...scope, lanes: [{ entries: [{ name: 'Session', spans: [{ from: 0, to: 4 }] }] }] })).toBe('');
  });

  it.each([
    ['a span that ends before it starts', row({ spans: [{ from: 5, to: 2 }] }), 'lanes.0.entries.0.spans.0 a span of "Fixed pause" ends at 2, which is not after its start at 5'],
    ['a span of no length', row({ spans: [{ from: 2, to: 2 }] }), 'ends at 2, which is not after its start at 2'],
    ['a span past the last tick', row({ spans: [{ from: 0, to: 11 }], outcome: undefined }), 'a span of "Fixed pause" ends at 11, past the last tick at 10'],
    ['a span before the first tick', row({ spans: [{ from: -1, to: 2 }] }), 'lanes.0.entries.0.spans.0.from'],
    ['a position between two ticks', row({ spans: [{ from: 0, to: 2.5 }] }), 'lanes.0.entries.0.spans.0.to'],
    ['spans that overlap', row({ spans: [{ from: 0, to: 3 }, { from: 2, to: 5 }] }), 'the spans of "Fixed pause" overlap or are out of order'],
    ['spans out of order', row({ spans: [{ from: 4, to: 5 }, { from: 0, to: 2 }] }), 'the spans of "Fixed pause" overlap or are out of order'],
    ['a row with no span', row({ spans: [] }), 'lanes.0.entries.0.spans'],
    ['a mark past the last tick', { lanes: [{ ...lane, mark: { ...mark, at: 11 } }] }, 'the mark "App ready" is at 11, past the last tick at 10'],
    ['a mark before the first tick', { lanes: [{ ...lane, mark: { ...mark, at: -1 } }] }, 'lanes.0.mark.at'],
    ['a mark without a label', { lanes: [{ ...lane, mark: { at: 3 } }] }, 'lanes.0.mark.label'],
    ['an outcome with no room after the bar', row({ spans: [{ from: 0, to: 10 }] }), '"Wastes time" stands after the last bar of "Fixed pause", which ends where the scale does'],
    ['two lanes, one without a name', { lanes: [lane, { ...lane, name: undefined }] }, 'lanes.1 name each lane when there is more than one'],
    ['a lane with nothing to say where its bars start and end', { lanes: [{ ...lane, mark: undefined }] }, 'give ticks, groups or a mark'],
    ['two strong rows in a lane', { lanes: [{ ...lane, entries: [{ ...entry, strong: true }, { ...entry, strong: true }] }] }, 'make at most one row of a lane strong'],
    ['a lane with no rows', { lanes: [{ ...lane, entries: [] }] }, 'lanes.0.entries'],
    ['no lanes', { lanes: [] }, 'lanes'],
    ['no scale', { steps: undefined }, 'give steps for a time scale, or ticks for a labelled one'],
    ['two scales', { ticks: scope.ticks }, 'give steps or ticks, not both'],
    ['one step', { steps: 1 }, 'steps'],
    ['one group', { groups: [{ label: 'Draft', from: 0, to: 10 }] }, 'groups'],
    ['groups that leave a gap', { groups: [{ label: 'Draft', from: 0, to: 4 }, { label: 'Saved', from: 5, to: 10 }] }, 'group "Saved" starts at 5. The groups cover the scale in order, so start it at 4'],
    ['groups that overlap', { groups: [{ label: 'Draft', from: 0, to: 4 }, { label: 'Saved', from: 3, to: 10 }] }, 'group "Saved" starts at 3'],
    ['groups that stop early', { groups: [{ label: 'Draft', from: 0, to: 4 }, { label: 'Saved', from: 4, to: 8 }] }, 'the groups stop at 8. They cover the scale, so end the last one at 10'],
    ['a group past the last tick', { groups: [{ label: 'Draft', from: 0, to: 4 }, { label: 'Saved', from: 4, to: 11 }] }, 'group "Saved" ends at 11, past the last tick at 10'],
    ['a group that ends before it starts', { groups: [{ label: 'Draft', from: 0, to: 4 }, { label: 'Saved', from: 4, to: 2 }] }, 'group "Saved" ends at 2, which is not after its start at 4'],
    ['a parallel scale with no groups', { parallel: true }, 'only groups run in parallel, and this timeline has none'],
    ['no description', { description: undefined }, 'description'],
    ['an unknown field', { marks: [] }, 'marks'],
    ['rows in place of entries', { lanes: [{ name: 'Fast run', mark, rows: [entry] }] }, 'lanes.0'],
  ])('rejects %s', (_name, changes, message) => {
    expect(problems(waits)).toBe('');
    expect(problems({ ...waits, ...changes })).toContain(message);
  });
});

describe('the timeline grid', () => {
  const [time, workers, phases] = [waits, scope, states].map((figure) => timeline.parse(figure));

  it('gives every step a column, and a gap column between parallel groups only', () => {
    expect(scaleTracks(time)).toBe('repeat(10, minmax(0, 1fr))');
    expect(scaleTracks(workers)).toBe('repeat(2, minmax(0, 1fr)) var(--space-16) repeat(2, minmax(0, 1fr))');
    expect(scaleTracks(phases)).toBe('repeat(12, minmax(0, 1fr))');
  });

  it('keeps a bar on its own side of a gap', () => {
    expect(gridColumn(time, { from: 0, to: 5 })).toBe('2 / 7');
    expect(gridColumn(workers, { from: 0, to: 2 })).toBe('2 / 4');
    expect(gridColumn(workers, { from: 2, to: 4 })).toBe('5 / 7');
    expect(gridColumn(workers, { from: 0, to: 4 })).toBe('2 / 7');
  });

  it('puts a moment label on the side with more room', () => {
    expect(markPlace(time, 3)).toEqual({ line: '4 / 5', label: '5 / 12', side: 'after' });
    expect(markPlace(time, 8)).toEqual({ line: '9 / 10', label: '2 / 10', side: 'before' });
    expect(markPlace(time, 0)).toEqual({ line: '2 / 3', label: '2 / 12', side: 'after' });
    expect(markPlace(time, 10).side).toBe('before');
  });

  it('ends the room for an outcome at the moment, or at the end of the scale', () => {
    expect(time.lanes.map((each) => outcomeSpan(time, each, each.entries[0].spans))).toEqual([{ from: 5, to: 10 }, { from: 5, to: 8 }]);
  });
});

describe('the words for a bar', () => {
  const texts = (figure: Data) => {
    const data = timeline.parse(figure);
    return data.lanes.map((each) => each.entries.map(({ spans }) => spans.map((span) => spanText(data, each, span))));
  };

  it('say where it stands against the moment', () => {
    expect(texts(waits)).toEqual([
      [['from the start until after App ready'], ['from the start until App ready']],
      [['from the start until before App ready'], ['from the start until App ready']],
    ]);
  });

  it('say its worker and tests on a labelled scale', () => {
    expect(texts(scope)).toEqual([[
      ['Worker 1, Test 1 only', 'Worker 1, Test 2 only', 'Worker 2, Test 3 only', 'Worker 2, Test 4 only'],
      ['Worker 1, from Test 1 to Test 2', 'Worker 2, from Test 3 to Test 4'],
      ['Worker 1, from Test 1 to Test 2', 'Worker 2, from Test 3 to Test 4'],
    ]]);
    expect(texts({ ...scope, lanes: [{ entries: [{ name: 'Session', spans: [{ from: 0, to: 4 }] }] }] })).toEqual([[['from Worker 1, Test 1 to Worker 2, Test 4']]]);
  });

  it('say its group on a time scale with groups', () => {
    expect(texts(states)).toEqual([[['during Saving']], [['from Saving to Saved, until Match']]]);
  });

  it('say a start that is not the start of the scale', () => {
    const spans = [[{ from: 1, to: 3 }], [{ from: 3, to: 5 }], [{ from: 4, to: 6 }]];
    expect(texts({ ...waits, lanes: [{ mark, entries: spans.map((each) => ({ name: 'Read', spans: each })) }] }))
      .toEqual([[['from before App ready until App ready'], ['from App ready until after App ready'], ['from after App ready until after App ready']]]);
  });
});