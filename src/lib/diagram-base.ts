import { z } from 'astro/zod';
import { idSchema, textSchema } from './problem-schema';

/** Fields every diagram kind has. Each kind's schema spreads these. */
export const base = {
  id: idSchema,
  title: textSchema,
  note: textSchema.optional(),
};

/** Visually hidden text that says in words what position, width or length shows. */
export const description = z.union([textSchema, z.array(textSchema).min(1)]);
