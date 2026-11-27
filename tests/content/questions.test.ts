import { describe, expect, it } from 'vitest';
import {
  discoverQuestions, exampleLanguages, questionTopics, switchableLanguages, type DiscoveredQuestion,
} from '../support/questions';

// Checks every question file against the Phase 2 brief and the phase 5 examples schema,
// independently of the collection schema.
const questions = discoverQuestions();
const roles = ['manual-qa', 'automation', 'sdet', 'senior'];
const levels = ['junior', 'mid', 'senior'];
const types = ['concept', 'scenario', 'behavioral', 'tooling'];
const required = ['title', 'topic', 'roles', 'level', 'type', 'oneLine', 'looksFor', 'trap', 'followUps'];
const allowed = new Set([...required, 'sources', 'examples']);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Problems with the `examples` field: 1 or 2 examples, each with an optional title and 1 to 3 variants. */
function exampleProblems(list: unknown): string[] {
  if (!Array.isArray(list) || list.length < 1 || list.length > 2) {
    return [`examples needs 1 or 2 items, has ${Array.isArray(list) ? list.length : 'none'}`];
  }
  const found: string[] = [];
  list.forEach((item, index) => {
    const at = `examples[${index}]`;
    if (!isRecord(item)) {
      found.push(`${at} must be an object with variants`);
      return;
    }
    for (const key of Object.keys(item)) if (key !== 'title' && key !== 'variants') found.push(`${at} has unknown field ${key}`);
    if ('title' in item && !isText(item.title)) found.push(`${at}.title, when present, must be text`);
    const variants = item.variants;
    if (!Array.isArray(variants) || variants.length < 1 || variants.length > 3) {
      found.push(`${at}.variants needs 1 to 3 items, has ${Array.isArray(variants) ? variants.length : 'none'}`);
      return;
    }
    const langs: unknown[] = [];
    variants.forEach((variant, position) => {
      const where = `${at}.variants[${position}]`;
      if (!isRecord(variant)) {
        found.push(`${where} must be an object with lang, label and code`);
        return;
      }
      for (const key of Object.keys(variant)) if (!['lang', 'label', 'code'].includes(key)) found.push(`${where} has unknown field ${key}`);
      langs.push(variant.lang);
      if (!exampleLanguages.includes(variant.lang as never)) {
        found.push(`${where}.lang "${String(variant.lang)}" is not one of ${exampleLanguages.join(', ')}`);
      }
      if (!isText(variant.label)) found.push(`${where}.label must be text`);
      if (!isText(variant.code)) found.push(`${where}.code must be non-empty text`);
    });
    if (new Set(langs).size !== langs.length) found.push(`${at} uses a language twice: ${langs.join(', ')}`);
    if (langs.length > 1 && !langs.every((lang) => switchableLanguages.includes(lang as never))) {
      found.push(`${at} has ${langs.length} variants; only ${switchableLanguages.join(', ')} can share an example, got ${langs.join(', ')}`);
    }
  });
  return found;
}

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
  if ('examples' in data) found.push(...exampleProblems(data.examples));

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

  const variant = (lang: string, extra: Record<string, unknown> = {}) => ({ lang, label: `Tool (${lang})`, code: 'x\n', ...extra });
  const withExamples = (examples: unknown) => ({ frontmatter: { ...valid?.frontmatter, examples } });

  it.each([
    ['one example with three switchable variants', [{ title: 'Refund check', variants: [variant('ts'), variant('python'), variant('java')] }]],
    ['two untitled single-language examples', [{ variants: [variant('sql')] }, { variants: [variant('gherkin')] }]],
    ['js alone', [{ variants: [variant('js')] }]],
  ])('accepts %s', (_name, examples) => {
    expect(base, 'a question file to copy').toBeDefined();
    expect(problemsOf({ ...valid, ...withExamples(examples) } as DiscoveredQuestion)).toEqual([]);
  });

  it.each(questionTopics.slice(questionTopics.indexOf('framework-design')))('accepts the phase 5 topic %s in its own folder', (topic) => {
    expect(base, 'a question file to copy').toBeDefined();
    const planted = { ...valid, folder: topic, frontmatter: { ...valid.frontmatter, topic } } as DiscoveredQuestion;
    expect(problemsOf(planted)).toEqual([]);
  });

  it('knows all twelve phase 5 topics', () => {
    expect(questionTopics.slice(questionTopics.indexOf('framework-design'))).toEqual([
      'framework-design', 'bdd', 'cypress', 'performance', 'security', 'ai-testing',
      'system-design', 'sql', 'java', 'python', 'javascript-typescript', 'containers',
    ]);
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
    ['an empty examples list', withExamples([]), 'examples needs 1 or 2 items, has 0'],
    ['three examples', withExamples(Array(3).fill({ variants: [variant('sql')] })), 'examples needs 1 or 2 items, has 3'],
    ['examples as a map', withExamples({ variants: [variant('sql')] }), 'examples needs 1 or 2 items, has none'],
    ['an example with no variants', withExamples([{ title: 'Empty', variants: [] }]), 'examples[0].variants needs 1 to 3 items, has 0'],
    ['an example without a variants list', withExamples([{ title: 'Bare' }]), 'examples[0].variants needs 1 to 3 items, has none'],
    ['four variants', withExamples([{ variants: [variant('ts'), variant('js'), variant('python'), variant('java')] }]), 'variants needs 1 to 3 items, has 4'],
    ['a language used twice', withExamples([{ variants: [variant('ts'), variant('ts')] }]), 'examples[0] uses a language twice: ts, ts'],
    ['a language outside the list', withExamples([{ variants: [variant('rust')] }]), 'variants[0].lang "rust" is not one of'],
    ['sql beside ts', withExamples([{ variants: [variant('ts'), variant('sql')] }]), 'only ts, js, python, java can share an example, got ts, sql'],
    ['yaml beside json', withExamples([{ variants: [variant('yaml'), variant('json')] }]), 'only ts, js, python, java can share an example'],
    ['an empty label', withExamples([{ variants: [variant('ts', { label: '  ' })] }]), 'variants[0].label must be text'],
    ['a missing label', withExamples([{ variants: [{ lang: 'ts', code: 'x' }] }]), 'variants[0].label must be text'],
    ['blank code', withExamples([{ variants: [variant('ts', { code: '  \n' })] }]), 'variants[0].code must be non-empty text'],
    ['code that is not text', withExamples([{ variants: [variant('ts', { code: 42 })] }]), 'variants[0].code must be non-empty text'],
    ['a typo in a variant field', withExamples([{ variants: [variant('ts', { langauge: 'ts' })] }]), 'variants[0] has unknown field langauge'],
    ['a typo in an example field', withExamples([{ titel: 'Typo', variants: [variant('ts')] }]), 'examples[0] has unknown field titel'],
    ['an empty title', withExamples([{ title: '', variants: [variant('ts')] }]), 'examples[0].title, when present, must be text'],
    ['a second example that is wrong', withExamples([{ variants: [variant('ts')] }, { variants: [variant('cobol')] }]), 'examples[1].variants[0].lang "cobol"'],
  ])('reports %s', (_name, override, message) => {
    expect(base, 'a question file to copy').toBeDefined();
    const planted = { ...valid, ...override } as DiscoveredQuestion;
    expect(problemsOf(planted).join('\n')).toContain(message);
  });
});
