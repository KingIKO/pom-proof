import { z } from 'astro/zod';
import { base, description } from './diagram-base';
import { textSchema } from './problem-schema';

/**
 * Timeline: bars on one scale that runs left to right and that every lane shares (diagram spec,
 * Timeline). The scale is either time, cut into equal `steps`, or a list of labelled `ticks` such as
 * tests 1 to 4. A position counts the edges between columns, so 0 is the start of the scale and a
 * span from 0 to 2 covers the first two columns. Lengths are relative and never a duration.
 * The row list is `entries`, because `rows` is a code key the plain-language scan skips.
 */

const position = z.number().int().min(0);
const range = { from: position, to: position };

const shape = z.strictObject({
  ...base,
  type: z.literal('timeline'),
  description,
  /** Equal columns of a time scale, drawn without labels. Give this or `ticks`. */
  steps: z.number().int().min(2).optional(),
  /** Labelled columns, with the name that stands at the head of the row names. */
  ticks: z.strictObject({ name: textSchema, labels: z.array(textSchema).min(2) }).optional(),
  /** Heads over ranges of columns, in order and covering the scale. */
  groups: z.array(z.strictObject({ label: textSchema, ...range })).min(2).optional(),
  /** The groups run at the same time, so a gap keeps their bars apart. */
  parallel: z.literal(true).optional(),
  lanes: z.array(z.strictObject({
    name: textSchema.optional(),
    /** A moment, drawn as a line through every row of the lane. */
    mark: z.strictObject({ label: textSchema, at: position }).optional(),
    entries: z.array(z.strictObject({
      name: textSchema,
      /** A second line under the name, for a tool or a qualifier. */
      detail: textSchema.optional(),
      spans: z.array(z.strictObject(range)).min(1),
      /** The one recommended or emphasised row of its lane. */
      strong: z.literal(true).optional(),
      /** One to three words, drawn after the row's last bar. */
      outcome: textSchema.optional(),
    })).min(1),
  })).min(1),
});

type Timeline = z.infer<typeof shape>;
type Lane = Timeline['lanes'][number];
type Span = Lane['entries'][number]['spans'][number];
type Path = Array<string | number>;

/** How many columns the scale has. */
const columnsOf = ({ steps, ticks }: Timeline) => ticks?.labels.length ?? steps ?? 0;

/** Data that would draw a wrong picture: each message names the part and the fix. */
function problems(timeline: Timeline): Array<{ message: string; path: Path }> {
  const { steps, ticks, groups = [], parallel, lanes } = timeline;
  const found: Array<{ message: string; path: Path }> = [];
  const add = (path: Path, message: string) => found.push({ message, path });
  if (steps === undefined && !ticks) add(['steps'], 'give steps for a time scale, or ticks for a labelled one');
  if (steps !== undefined && ticks) add(['steps'], 'give steps or ticks, not both');
  const end = columnsOf(timeline);
  if (!end) return found;
  const checkRange = (path: Path, name: string, { from, to }: Span) => {
    if (to <= from) add(path, `${name} ends at ${to}, which is not after its start at ${from}`);
    if (to > end) add(path, `${name} ends at ${to}, past the last tick at ${end}`);
  };

  groups.forEach((group, index) => {
    const name = `group "${group.label}"`;
    checkRange(['groups', index], name, group);
    const start = index ? groups[index - 1].to : 0;
    if (group.from !== start) add(['groups', index], `${name} starts at ${group.from}. The groups cover the scale in order, so start it at ${start}`);
  });
  const covered = groups.at(-1)?.to ?? end;
  if (covered < end) add(['groups'], `the groups stop at ${covered}. They cover the scale, so end the last one at ${end}`);
  if (parallel && !groups.length) add(['parallel'], 'only groups run in parallel, and this timeline has none');

  lanes.forEach(({ name, mark, entries }, laneIndex) => {
    const lane: Path = ['lanes', laneIndex];
    if (lanes.length > 1 && !name) add(lane, 'name each lane when there is more than one');
    if (mark && mark.at > end) add([...lane, 'mark'], `the mark "${mark.label}" is at ${mark.at}, past the last tick at ${end}`);
    if (!ticks && !groups.length && !mark) add(lane, 'give ticks, groups or a mark, so each bar can say in words where it starts and ends');
    if (entries.filter(({ strong }) => strong).length > 1) add(lane, 'make at most one row of a lane strong');
    entries.forEach(({ name: row, spans, outcome }, entryIndex) => {
      const path = [...lane, 'entries', entryIndex];
      spans.forEach((span, index) => {
        checkRange([...path, 'spans', index], `a span of "${row}"`, span);
        if (index && span.from < spans[index - 1].to) add([...path, 'spans', index], `the spans of "${row}" overlap or are out of order`);
      });
      // These checks also run on a row without spans, which the shape already rejects.
      if (outcome && (spans.at(-1)?.to ?? 0) >= end) add([...path, 'outcome'], `"${outcome}" stands after the last bar of "${row}", which ends where the scale does`);
    });
  });
  return found;
}

export const timeline = shape.superRefine((data, context) => {
  for (const { message, path } of problems(data)) context.addIssue({ code: 'custom', message, path });
});

/** The positions a gap follows: the end of every group but the last, when groups run in parallel. */
const gapsOf = ({ groups = [], parallel }: Timeline) => (parallel ? groups.slice(0, -1).map(({ to }) => to) : []);

/** The grid columns of the scale, one per step or tick, with a gap column between parallel groups. */
export function scaleTracks(timeline: Timeline) {
  const edges = [0, ...gapsOf(timeline), columnsOf(timeline)];
  return edges.slice(1).map((edge, index) => `repeat(${edge - edges[index]}, minmax(0, 1fr))`).join(' var(--space-16) ');
}

/**
 * The grid line of a position, with the name column first, so position 0 is line 2. Where a gap
 * stands at the position, a bar that starts there begins after it and a bar that ends there stops before.
 */
function gridLine(timeline: Timeline, at: number, edge: 'start' | 'end') {
  return 2 + at + gapsOf(timeline).filter((gap) => gap < at || (gap === at && edge === 'start')).length;
}

/** The grid lines a range sits between. */
export const gridColumn = (timeline: Timeline, { from, to }: Span) =>
  `${gridLine(timeline, from, 'start')} / ${gridLine(timeline, to, 'end')}`;

/**
 * Where a moment is drawn: its line ends the column before it, or starts the scale, and its label
 * sits on the side of the line with more room.
 */
export function markPlace(timeline: Timeline, at: number) {
  const end = columnsOf(timeline);
  const before = at > end / 2;
  return {
    line: gridColumn(timeline, at ? { from: at - 1, to: at } : { from: 0, to: 1 }),
    label: gridColumn(timeline, before ? { from: 0, to: at } : { from: at, to: end }),
    side: before ? 'before' : 'after',
  };
}

/** Where an outcome stands: from the row's last bar to the lane's mark, or to the end of the scale. */
export function outcomeSpan(timeline: Timeline, { mark }: Lane, spans: readonly Span[]): Span {
  const from = spans[spans.length - 1].to;
  return { from, to: mark && mark.at > from ? mark.at : columnsOf(timeline) };
}

/**
 * A span's start and end in words, for a screen reader: by group and tick on a labelled scale, and
 * against the lane's mark. The schema makes sure there is one or the other.
 */
export function spanText({ ticks, groups = [] }: Timeline, { mark }: Lane, { from, to }: Span) {
  const groupAt = (column: number) => groups.find((group) => group.from <= column && column < group.to)?.label;
  const [first, last] = [groupAt(from), groupAt(to - 1)];
  const tick = (column: number) => `${ticks?.name} ${ticks?.labels[column]}`;
  const words: string[] = [];
  if (ticks && first !== last) words.push(`from ${first}, ${tick(from)} to ${last}, ${tick(to - 1)}`);
  else if (ticks) {
    if (first) words.push(first);
    words.push(to - from === 1 ? `${tick(from)} only` : `from ${tick(from)} to ${tick(to - 1)}`);
  } else if (first) words.push(first === last ? `during ${first}` : `from ${first} to ${last}`);
  if (mark) {
    const relative = (at: number) => `${at < mark.at ? 'before ' : at > mark.at ? 'after ' : ''}${mark.label}`;
    const ending = `until ${relative(to)}`;
    words.push(words.length ? ending : `from ${from ? relative(from) : 'the start'} ${ending}`);
  }
  return words.join(', ');
}
