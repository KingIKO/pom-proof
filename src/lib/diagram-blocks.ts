import { z } from 'astro/zod';
import { base, description } from './diagram-base';
import { idSchema, textSchema } from './problem-schema';

/**
 * Blocks: boxes in rows, with the parts each one holds and arrows between neighbours (diagram spec,
 * Blocks). A drawing is a list of `tiers`, top to bottom, and each tier is one row of boxes. Nesting
 * stops at a part inside a box, because a box inside a box has no approved drawing.
 */

const part = z.strictObject({
  name: textSchema,
  items: z.array(textSchema).min(1).optional(),
  strong: z.literal(true).optional(),
});

const box = z.strictObject({
  /** Needed only by a box that another box links to. */
  id: idSchema.optional(),
  title: textSchema,
  strong: z.literal(true).optional(),
  parts: z.array(part).min(1).optional(),
  /** An arrow to the next box in the row or to the box below. A screen reader hears `label`, then the target's title. */
  linkTo: z.strictObject({ label: textSchema, target: idSchema }).optional(),
});

/** The spec draws two or three boxes side by side, down to 320 px. */
const maxAcross = 3;
const tiers = z.array(z.array(box).min(1).max(maxAcross)).min(1);

const shape = z.strictObject({
  ...base,
  type: z.literal('blocks'),
  description,
  /** One drawing. Give this or `panels`. */
  tiers: tiers.optional(),
  /** Before and after, in that order. `result` is what the panel comes to, such as "3 edits". */
  panels: z.array(z.strictObject({ name: textSchema, tiers, result: textSchema })).length(2).optional(),
});

type Blocks = z.infer<typeof shape>;
export type Tiers = z.infer<typeof tiers>;
export type Box = z.infer<typeof box>;
type Path = Array<string | number>;

/** The box a link points to, in the same drawing. */
export const linkTarget = (drawing: Tiers, target: string) => drawing.flat().find(({ id }) => id === target);

/** Which way a box's arrow points: `across` to the next box in its row, or `down` to the only box of the row below. */
export function linkDirection(drawing: Tiers, tier: number, column: number): 'across' | 'down' | undefined {
  const target = drawing[tier][column].linkTo?.target;
  if (!target) return undefined;
  if (drawing[tier][column + 1]?.id === target) return 'across';
  const below = drawing[tier + 1] ?? [];
  return below.length === 1 && below[0].id === target ? 'down' : undefined;
}

/** How many of a box's parts stand side by side: all of them, when the box has its row to itself and they fit in one. */
export const partsAcross = (count: number, alone: boolean) => (alone && count <= maxAcross ? count : 1);

/** Data that would draw a wrong picture: each message names the part and the fix. */
function problems({ tiers: single, panels = [] }: Blocks): Array<{ message: string; path: Path }> {
  const found: Array<{ message: string; path: Path }> = [];
  const add = (path: Path, message: string) => found.push({ message, path });
  if (Boolean(single) === panels.length > 0) add(['tiers'], 'give tiers for one drawing, or two panels for before and after');
  const drawings: Array<[Path, Tiers]> = [
    ...(single ? [[['tiers'], single] as [Path, Tiers]] : []),
    ...panels.map((panel, index): [Path, Tiers] => [['panels', index, 'tiers'], panel.tiers]),
  ];
  for (const [at, drawing] of drawings) {
    const ids = drawing.flat().flatMap(({ id }) => id ?? []);
    for (const id of new Set(ids.filter((value, index) => ids.indexOf(value) !== index))) add(at, `two boxes have the id "${id}"`);
    drawing.forEach((row, tier) => {
      row.forEach(({ title, linkTo }, column) => {
        if (!linkTo) return;
        const path = [...at, tier, column, 'linkTo'];
        if (!linkTarget(drawing, linkTo.target)) add(path, `"${title}" links to "${linkTo.target}", which is not a box in this drawing`);
        else if (!linkDirection(drawing, tier, column)) add(path, `"${title}" links to "${linkTo.target}", which is not the next box in its row or the one box of the row below`);
      });
      // With enlarged text on a phone a row stacks, and the arrows down stand under its last box.
      const directions = row.map((_, column) => linkDirection(drawing, tier, column));
      if (row.some(({ linkTo }, column) => linkTo && !directions[column])) return;
      const down = directions.map((direction) => direction === 'down');
      if (down.includes(true) && !down.every(Boolean) && down.indexOf(true) !== row.length - 1) {
        add([...at, tier], 'link down from every box of a row, or only from its last one');
      }
    });
  }
  const boxes = drawings.flatMap(([, drawing]) => drawing.flat());
  if (boxes.some(({ strong }) => strong) && boxes.some(({ parts = [] }) => parts.some(({ strong }) => strong))) {
    add([], 'make one kind of thing strong in a figure, boxes or parts');
  }
  return found;
}

export const blocks = shape.superRefine((data, context) => {
  for (const { message, path } of problems(data)) context.addIssue({ code: 'custom', message, path });
});
