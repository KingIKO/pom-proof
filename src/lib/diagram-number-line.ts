import { z } from 'astro/zod';
import { base, description } from './diagram-base';
import { textSchema } from './problem-schema';

/**
 * A number line for partitions and boundary values: one band per partition, a line where the rule
 * changes, and every value from `min` to `max`, with the values boundary value analysis checks
 * boxed. On a narrow figure only the `segments` are drawn, one around each line.
 */

const value = z.number().int();

/** At the 34rem switch to the narrow layout, 21 columns are one 1.625rem marker wide each. */
const maxValues = 21;
/** The values a narrow segment holds (diagram spec, From 320 to 360 px). */
const maxSegmentValues = 6;

interface Line {
  min: number;
  max: number;
  bands: Array<{ from: number; to: number; label: string; kind: 'accept' | 'reject' }>;
  twoValue: number[];
  threeValue?: number[];
  segments: Array<{ title: string; from: number; to: number }>;
}

const list = (values: Iterable<number>) => [...values].sort((a, b) => a - b).join(', ');

/** The first value of each band after the first: the rule changes just before it. */
export const boundaries = (bands: Line['bands']) => bands.slice(1).map(({ from }) => from);

/** What makes a line wrong: each message names the part and the fix. */
function problems({ min, max, bands, twoValue, threeValue = [], segments }: Line): string[] {
  if (min >= max) return [`min ${min} must be below max ${max}`];
  const found: string[] = [];
  const size = max - min + 1;
  if (size > maxValues) found.push(`${min} to ${max} is ${size} values. Draw at most ${maxValues}`);

  const kinds = new Map<string, string>();
  bands.forEach(({ from, to, label, kind }, index) => {
    const name = `band "${label}" (${from} to ${to})`;
    if (from > to) found.push(`${name} ends before it starts`);
    const expected = index ? bands[index - 1].to + 1 : min;
    if (from > expected) found.push(`${name} leaves out ${from - 1 === expected ? expected : `${expected} to ${from - 1}`}. Start it at ${expected}`);
    if (from < expected) found.push(index ? `${name} overlaps the band before it. Start it at ${expected}` : `${name} starts below min ${min}`);
    if (index && bands[index - 1].label === label) found.push(`${name} repeats the label before it, so no rule changes at its line`);
    if ((kinds.get(label) ?? kind) !== kind) found.push(`label "${label}" is both accept and reject`);
    kinds.set(label, kind);
  });
  const end = bands.at(-1)!.to;
  if (end !== max) found.push(`the last band ends at ${end}. End it at max ${max}`);

  const marks = [...twoValue, ...threeValue];
  for (const mark of new Set(marks)) {
    if (mark < min || mark > max) found.push(`mark ${mark} is outside ${min} to ${max}`);
    if (marks.filter((other) => other === mark).length > 1) found.push(`mark ${mark} is listed twice`);
  }
  // 2-value BVA checks the values on both sides of every line. 3-value BVA adds their other neighbours.
  const two = new Set(boundaries(bands).flatMap((from) => [from - 1, from]));
  if (list(two) !== list(twoValue)) found.push(`twoValue is ${list(twoValue)}. The values beside the lines are ${list(two)}`);
  const added = new Set([...two].flatMap((mark) => [mark - 1, mark + 1]).filter((mark) => !two.has(mark)));
  if (threeValue.length && list(added) !== list(threeValue)) found.push(`threeValue is ${list(threeValue)}. The values next to ${list(two)} are ${list(added)}`);

  segments.forEach(({ title, from, to }, index) => {
    const name = `segment "${title}" (${from} to ${to})`;
    if (from < min || to > max) found.push(`${name} is outside ${min} to ${max}`);
    if (to - from + 1 > maxSegmentValues) found.push(`${name} has ${to - from + 1} values. Draw at most ${maxSegmentValues}`);
    if (index && from <= segments[index - 1].to) found.push(`${name} overlaps the segment before it`);
    if (!boundaries(bands).some((line) => from < line && line <= to)) found.push(`${name} holds no line. Put one segment around each line`);
  });
  const drawn = (mark: number) => segments.some(({ from, to }) => from <= mark && mark <= to);
  for (const line of boundaries(bands)) {
    if (!segments.some(({ from, to }) => from < line && line <= to)) found.push(`no segment holds the line between ${line - 1} and ${line}`);
  }
  for (const mark of new Set(marks)) if (!drawn(mark)) found.push(`no segment holds mark ${mark}`);
  return found;
}

export const numberLine = z.strictObject({
  ...base,
  type: z.literal('number-line'),
  description,
  min: value,
  max: value,
  bands: z.array(z.strictObject({ from: value, to: value, label: textSchema, kind: z.enum(['accept', 'reject']) })).min(2),
  twoValue: z.array(value).min(1),
  threeValue: z.array(value).min(1).optional(),
  segments: z.array(z.strictObject({ title: textSchema, from: value, to: value })).min(1),
}).superRefine((line, context) => {
  for (const message of problems(line)) context.addIssue({ code: 'custom', message });
});
