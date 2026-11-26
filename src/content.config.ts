import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { idSchema, problemSchema, roleSchema, textSchema } from './lib/problem-schema';

const load = (base: string, extension: 'md' | 'yaml') => glob({
  base: `./content/${base}`,
  pattern: `**/*.${extension}`,
  generateId: ({ entry }) => entry.slice(0, -(extension.length + 1)),
});

export const collections = {
  problems: defineCollection({
    loader: load('problems', 'md'),
    schema: problemSchema,
  }),
  editorials: defineCollection({
    loader: load('editorials', 'md'),
    schema: z.strictObject({ problem: reference('problems') }),
  }),
  questions: defineCollection({
    loader: load('questions', 'md'),
    schema: z.strictObject({
      title: textSchema,
      topic: idSchema,
      modelAnswer: textSchema,
      looksFor: z.array(textSchema).min(1),
      mistakes: z.array(textSchema).min(1),
      followUps: z.array(textSchema).min(1),
    }),
  }),
  tracks: defineCollection({
    loader: load('tracks', 'yaml'),
    schema: z.strictObject({
      title: textSchema,
      role: roleSchema,
      problems: z.array(reference('problems')).min(1),
    }),
  }),
};
