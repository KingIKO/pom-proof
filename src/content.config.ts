import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { problemSchema, roleSchema, textSchema } from './lib/problem-schema';

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
      topic: z.enum([
        'fundamentals', 'test-design', 'bug-reports', 'agile', 'automation-strategy',
        'locators-waits', 'flaky-tests', 'playwright', 'selenium', 'api',
        'ci-git-docker', 'behavioral', 'leadership',
      ]),
      roles: z.array(roleSchema).min(1),
      level: z.enum(['junior', 'mid', 'senior']),
      type: z.enum(['concept', 'scenario', 'behavioral', 'tooling']),
      oneLine: textSchema,
      looksFor: z.array(textSchema).min(3).max(5),
      trap: textSchema,
      followUps: z.array(z.strictObject({ question: textSchema, answer: textSchema })).min(1).max(3),
      sources: z.array(z.strictObject({ label: textSchema, url: z.url({ protocol: /^https?$/ }) })).optional(),
    }),
  }),
  tracks: defineCollection({
    loader: load('tracks', 'yaml'),
    schema: z.strictObject({
      title: textSchema,
      role: roleSchema,
      summary: textSchema,
      sections: z.array(z.strictObject({
        title: textSchema,
        note: textSchema.optional(),
        problems: z.array(reference('problems')),
        questions: z.array(reference('questions')),
      }).refine(({ problems, questions }) => problems.length + questions.length > 0,
        'Each section needs at least one problem or question')).min(1),
    }),
  }),
};
