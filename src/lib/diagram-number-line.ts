import { z } from 'astro/zod';
import { base, description } from './diagram-base';
import { textSchema } from './problem-schema';

/**
 * A number line for partitions and boundary values: one band per partition, a line where the rule
 * changes, and every value the bands cover, with the values boundary value analysis checks boxed. On
 * a narrow figure only the `segments` are drawn, one around each line.
 */

const value = z.number().int();

/** At the 34rem switch to the narrow layout, 21 columns are one 1.625rem marker wide each. */
const maxValues = 21;
/** The values a narrow segment holds (diagram spec, From 320 to 360 px). */
const maxSegmentValues = 6;

interface Line {
  bands: Array<{ from: number; to: number; label: string; kind: 'accept' | 'reject' }>;
  threeValue?: boolean;
  segments: Array<{ title: string; from: number; to: number }>;
}

/** The first value of each band after the first: the rule changes just before it. */
export const boundaries = (bands: Array<{ from: number }>) => bands.slice(1).map(({ from }) => from);

const inOrder = (values: Iterable<number>) => [...new Set(values)].sort((a, b) => a - b);

/**
 * The values the bands decide: the first and the last one drawn, and the ones that get a box. 2-value
 * BVA checks both sides of every line. 3-value BVA adds their other neighbours, which stop at the
 * drawn range: an amount that starts at 0 has no neighbour below it.
 */
export function lineValues({ bands, threeValue }: { bands: Array<{ from: number; to: number }>; threeValue?: boolean }) {
  const [min, max] = [bands[0].from, bands[bands.length - 1].to];
  const two = inOrder(boundaries(bands).flatMap((from) => [from - 1, from]));
  const added = threeValue ? inOrder(two.flatMap((mark) => [mark - 1, mark + 1])) : [];
  return { min, max, two, three: added.filter((mark) => !two.includes(mark) && min <= mark && mark <= max) };
}

/** What makes a line wrong: each message names the part and the fix. */
function problems(line: Line): string[] {
  const { bands, threeValue, segments } = line;
  // These checks also run on a line without bands, which the shape already rejects.
  if (!bands.length) return [];
  const { min, max, two, three } = lineValues(line);
  const found: string[] = [];
  const size = max - min + 1;
  if (size > maxValues) found.push(`${min} to ${max} is ${size} values. Draw at most ${maxValues}`);

  const kinds = new Map<string, string>();
  bands.forEach(({ from, to, label, kind }, index) => {
    const name = `band "${label}" (${from} to ${to})`;
    if (from > to) found.push(`${name} ends before it starts`);
    const expected = index ? bands[index - 1].to + 1 : from;
    if (from > expected) found.push(`${name} leaves out ${from - 1 === expected ? expected : `${expected} to ${from - 1}`}. Start it at ${expected}`);
    if (from < expected) found.push(`${name} overlaps the band before it. Start it at ${expected}`);
    if (index && bands[index - 1].label === label) found.push(`${name} repeats the label before it, so no rule changes at its line`);
    if ((kinds.get(label) ?? kind) !== kind) found.push(`label "${label}" is both accept and reject`);
    kinds.set(label, kind);
  });
  if (threeValue && !three.length) found.push('threeValue adds no value to this line. Leave it out');

  segments.forEach(({ title, from, to }, index) => {
    const name = `segment "${title}" (${from} to ${to})`;
    if (from < min || to > max) found.push(`${name} is outside ${min} to ${max}`);
    if (to - from + 1 > maxSegmentValues) found.push(`${name} has ${to - from + 1} values. Draw at most ${maxSegmentValues}`);
    if (index && from <= segments[index - 1].to) found.push(`${name} overlaps the segment before it`);
    if (!boundaries(bands).some((at) => from < at && at <= to)) found.push(`${name} holds no line. Put one segment around each line`);
  });
  for (const at of boundaries(bands)) {
    if (!segments.some(({ from, to }) => from < at && at <= to)) found.push(`no segment holds the line between ${at - 1} and ${at}`);
  }
  for (const mark of [...two, ...three]) {
    if (!segments.some(({ from, to }) => from <= mark && mark <= to)) found.push(`no segment holds ${mark}, which BVA checks`);
  }
  return found;
}

export const numberLine = z.strictObject({
  ...base,
  type: z.literal('number-line'),
  description,
  /** The partitions in order. The first one's start and the last one's end are where the drawing stops. */
  bands: z.array(z.strictObject({ from: value, to: value, label: textSchema, kind: z.enum(['accept', 'reject']) })).min(2),
  /** Also boxes the values 3-value BVA adds. */
  threeValue: z.literal(true).optional(),
  segments: z.array(z.strictObject({ title: textSchema, from: value, to: value })).min(1),
}).superRefine((line, context) => {
  for (const message of problems(line)) context.addIssue({ code: 'custom', message });
});
