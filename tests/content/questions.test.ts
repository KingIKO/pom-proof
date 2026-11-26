import { describe, expect, it } from 'vitest';
import { discoverQuestions, questionTopics, type DiscoveredQuestion } from '../support/questions';

// Checks every question file against the Phase 2 brief, independently of the collection schema.
const questions = discoverQuestions();
const roles = ['manual-qa', 'automation', 'sdet', 'senior'];
const levels = ['junior', 'mid', 'senior'];
const types = ['concept', 'scenario', 'behavioral', 'tooling'];
const required = ['title', 'topic', 'roles', 'level', 'type', 'oneLine', 'looksFor', 'trap', 'followUps'];
const allowed = new Set([...required, 'sources']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

/** Words a reader would count: tokens with a letter or digit, so Markdown markers are left out. */
function countWords(markdown: string) {
  return markdown.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

/** Problems with one question, each naming the field and what is wrong. */
function problemsOf({ frontmatter: data, body, folder, slug }: DiscoveredQuestion): string[] {
  const found: string[] = [];
  const add = (message: string) => found.push(message);

  for (const key of required) if (!(key in data)) add(`missing ${key}`);
  for (const key of Object.keys(data)) if (!allowed.has(key)) add(`unknown field ${key}`);

  for (const key of ['title', 'oneLine', 'trap']) if (key in data && !isText(data[key])) add(`${key} must be text`);
  if ('topic' in data) {
    if (!questionTopics.includes(data.topic as never)) add(`topic "${String(data.topic)}" is not one of ${questionTopics.join(', ')}`);
    if (data.topic !== folder) add(`topic "${String(data.topic)}" must match its folder "${folder}"`);
  }
  if (!slugPattern.test(slug)) add(`file name "${slug}" must be lowercase words joined by hyphens`);
  if ('roles' in data) {
    const list = data.roles;
    if (!Array.isArray(list) || list.length === 0) add('roles must list at least one role');
    else {
      for (const role of list) if (!roles.includes(role)) add(`role "${String(role)}" is not one of ${roles.join(', ')}`);
      if (new Set(list).size !== list.length) add('roles must list each role once');
    }
  }
  if ('level' in data && !levels.includes(data.level as string)) add(`level "${String(data.level)}" is not one of ${levels.join(', ')}`);
  if ('type' in data && !types.includes(data.type as string)) add(`type "${String(data.type)}" is not one of ${types.join(', ')}`);
  if ('looksFor' in data) {
    const list = data.looksFor;
    if (!Array.isArray(list) || list.length < 3 || list.length > 5) add(`looksFor needs 3 to 5 items, has ${Array.isArray(list) ? list.length : 'none'}`);
    else if (!list.every(isText)) add('every looksFor item must be text');
  }
  if ('followUps' in data) {
    const list = data.followUps;
    if (!Array.isArray(list) || list.length < 1 || list.length > 3) add(`followUps needs 1 to 3 items, has ${Array.isArray(list) ? list.length : 'none'}`);
    else {
      list.forEach((item, index) => {
        const entry = item as Record<string, unknown> | null;
        if (!entry || typeof entry !== 'object' || !isText(entry.question) || !isText(entry.answer)) {
          add(`followUps[${index}] needs a question and an answer`);
        } else if (Object.keys(entry).some((key) => key !== 'question' && key !== 'answer')) {
          add(`followUps[${index}] has fields other than question and answer`);
        }
      });
    }
  }
  if ('sources' in data) {
    const list = data.sources;
    if (!Array.isArray(list) || list.length === 0) add('sources, when present, must list at least one source');
    else {
      list.forEach((item, index) => {
        const entry = item as Record<string, unknown> | null;
        if (!entry || typeof entry !== 'object' || !isText(entry.label) || !isText(entry.url) || !/^https:\/\/\S+$/.test(entry.url)) {
          add(`sources[${index}] needs a label and an https url`);
        } else if (Object.keys(entry).some((key) => key !== 'label' && key !== 'url')) {
          add(`sources[${index}] has fields other than label and url`);
        }
      });
    }
  }

  const words = countWords(body);
  if (words < 80 || words > 220) add(`body has ${words} words; write 80 to 220`);
  const headings = [...body.matchAll(/^(#{1,6})[ \t]+(.+?)[ \t#]*$/gm)];
  const last = headings.at(-1);
  if (!last || last[1] !== '###' || last[2].trim() !== 'Example') {
    add(`body must end with a "### Example" section; last heading is ${last ? `"${last[0].trim()}"` : 'missing'}`);
  } else if (!body.slice(last.index + last[0].length).trim()) {
    add('the Example section is empty');
  }
  return found;
}

describe('question files', () => {
  it('exist', () => {
    expect(questions.length, 'no question files under content/questions').toBeGreaterThan(0);
  });

  it('use unique ids, so review state keyed by id cannot collide', () => {
    expect(questions.length).toBeGreaterThan(0);
    const bySlug = new Map<string, string[]>();
    for (const { slug, file } of questions) bySlug.set(slug, [...(bySlug.get(slug) ?? []), file]);
    expect([...bySlug.values()].filter((files) => files.length > 1), 'question file names used twice').toEqual([]);
    expect(new Set(questions.map(({ id }) => id)).size).toBe(questions.length);
  });

  it('report their count per topic', () => {
    expect(questions.length).toBeGreaterThan(0);
    const counts = Object.fromEntries(questionTopics.map((topic) => [topic, 0]));
    for (const { folder } of questions) counts[folder] = (counts[folder] ?? 0) + 1;
    console.log(`Questions per topic (${questions.length} total):\n${Object.entries(counts)
      .map(([topic, count]) => `  ${topic.padEnd(20)} ${count}`).join('\n')}`);
    expect(Object.values(counts).reduce((sum, count) => sum + count, 0)).toBe(questions.length);
  });

  it.each(questions.map((question) => [question.file, question] as const))('%s matches the brief', (_file, question) => {
    expect(problemsOf(question)).toEqual([]);
  });
});

describe('the question checks catch planted mistakes', () => {
  const base = questions[0];
  const valid: DiscoveredQuestion = base && {
    ...base,
    folder: 'playwright',
    slug: 'planted-question',
    frontmatter: {
      title: 'When should a test use two browser contexts?',
      topic: 'playwright',
      roles: ['automation'],
      level: 'mid',
      type: 'tooling',
      oneLine: 'Use separate contexts for separate sessions.',
      looksFor: ['One', 'Two', 'Three'],
      trap: 'Using a second tab.',
      followUps: [{ question: 'Why?', answer: 'Because.' }],
    },
    body: `${'word '.repeat(90)}\n\n### Example\n\nTwo customers book the last slot.\n`,
  };

  it('accepts a valid planted question', () => {
    expect(base, 'a question file to copy').toBeDefined();
    expect(problemsOf(valid)).toEqual([]);
  });

  it.each([
    ['a missing trap', { frontmatter: { ...valid?.frontmatter, trap: undefined } }, 'trap must be text'],
    ['two looksFor items', { frontmatter: { ...valid?.frontmatter, looksFor: ['One', 'Two'] } }, 'looksFor needs 3 to 5'],
    ['six looksFor items', { frontmatter: { ...valid?.frontmatter, looksFor: ['1', '2', '3', '4', '5', '6'] } }, 'looksFor needs 3 to 5'],
    ['a topic outside the list', { frontmatter: { ...valid?.frontmatter, topic: 'pens' } }, 'is not one of'],
    ['a typo in a field name', { frontmatter: { ...valid?.frontmatter, followups: [] } }, 'unknown field followups'],
    ['four follow-ups', { frontmatter: { ...valid?.frontmatter, followUps: Array(4).fill({ question: 'Q?', answer: 'A.' }) } }, 'followUps needs 1 to 3'],
    ['a short body', { body: 'Too short.\n\n### Example\n\nOne line.\n' }, 'write 80 to 220'],
    ['a long body', { body: `${'word '.repeat(230)}\n\n### Example\n\nOne line.\n` }, 'write 80 to 220'],
    ['no Example section', { body: `${'word '.repeat(90)}\n` }, 'must end with a "### Example" section'],
    ['a section after Example', { body: `${'word '.repeat(90)}\n\n### Example\n\nText.\n\n### Notes\n\nMore.\n` }, 'must end with a "### Example" section'],
  ])('reports %s', (_name, override, message) => {
    expect(base, 'a question file to copy').toBeDefined();
    const planted = { ...valid, ...override } as DiscoveredQuestion;
    expect(problemsOf(planted).join('\n')).toContain(message);
  });
});
