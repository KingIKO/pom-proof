import { z } from 'astro/zod';
import { base, description } from './diagram-base';
import { blocks } from './diagram-blocks';
import { matrix } from './diagram-matrix';
import { numberLine } from './diagram-number-line';
import { timeline } from './diagram-timeline';
import { textSchema } from './problem-schema';

/**
 * Concept diagrams on Study pages (diagram plan, section 2). A page lists its figures in the
 * `diagrams` frontmatter field and places each one with a ```diagram fence that holds its id.
 * Diagram text follows the plain-language rules and does not count toward the body's words or
 * `minutes`.
 */

/**
 * Bars stacked top to bottom, one stack per shape, all on one width scale. `width` is relative
 * testing effort on a 1 to 5 scale, taken from the page's sources and never measured; `widest`
 * marks the one emphasised layer of a shape.
 */
const layerStack = z.strictObject({
  ...base,
  type: z.literal('layer-stack'),
  description,
  shapes: z.array(z.strictObject({
    name: textSchema,
    layers: z.array(z.strictObject({
      label: textSchema,
      width: z.number().int().min(1).max(5),
      widest: z.boolean().optional(),
    })).min(2)
      .refine((layers) => layers.filter(({ widest }) => widest).length === 1, 'Mark exactly one layer of each shape as widest')
      .refine((layers) => {
        const top = Math.max(...layers.map(({ width }) => width));
        return layers.every(({ width, widest }) => (widest ? width === top : width < top));
      }, 'The widest layer must be the only one at the largest width'),
  })).min(1).max(3),
});

export const diagramSchema = z.discriminatedUnion('type', [layerStack, matrix, numberLine, timeline, blocks]);
export type Diagram = z.infer<typeof diagramSchema>;

export const diagramsSchema = z.array(diagramSchema).min(1).max(2)
  .refine((diagrams) => new Set(diagrams.map(({ id }) => id)).size === diagrams.length, 'Give each diagram its own id');
