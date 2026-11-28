import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeProse, scanProse, sentencesOf } from '../support/plain-language';
import { discoverProblems, root } from '../support/problems';
import { discoverQuestions, questionTopics } from '../support/questions';
import {
  discoverStudyModules, discoverStudyPages, readTopicMap, topicMapUrls,
  type DiscoveredStudyModule, type DiscoveredStudyPage, type TopicMap,
} from '../support/study';

/**
 * The Study authoring rules (practice and study plan, sections 3 and 4), checked from the files
 * and independently of the collection schema: page shape, word limits and the minutes formula,
 * prerequisites without cycles, practice and question topics that match real content, sources
 * from the topic map, and the plain-language rules on every Study file.
 */

const headings = ['What it is', 'How it works', 'Why it helps', 'When not to use it'];
const required = ['title', 'module', 'order', 'level', 'summary', 'minutes', 'outcomes', 'useWhen', 'avoidWhen', 'sources'];
const allowed = new Set([...required, 'prerequisites', 'practiceTopics', 'questionTopics', 'examples', 'whatChanged', 'expertsDisagree']);
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pageId = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

const isText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const textList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isText);
const sentences = (text: string) => sentencesOf(normalizeProse(text)).filter((sentence) => /[\p{L}\p{N}]/u.test(sentence));
/** One sentence that starts with a capital or a number and ends with a full stop or question mark. */
const isSentence = (text: string) => /^[\p{Lu}\p{N}`"]/u.test(text.trim()) && /[.?]$/.test(text.trim()) && sentences(text).length === 1;

const withoutFences = (body: string) => body.replace(/^ {0,3}(`{3,}|~{3,})[^\n]*\n[\s\S]*?^ {0,3}\1[^\n]*$/gm, '');

/** Words outside fenced code, so headings and prose count and code does not. */
function bodyWords(body: string) {
  return withoutFences(body).split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;
}

interface Context {
  modules: ReadonlySet<string>;
  problemTopics: ReadonlySet<string>;
  questionCounts: ReadonlyMap<string, number>;
  urls: ReadonlyMap<string, ReadonlySet<string>>;
  map: TopicMap;
  today: string;
}

/** The topic map concept a page writes up: the one in its module with its order. */
function conceptOf(page: DiscoveredStudyPage, map: TopicMap, moduleTitle: string | undefined) {
  return map.concepts.find(({ module, order }) => module === moduleTitle && order === page.frontmatter.order);
}

/** Problems with one page, each naming the field and what is wrong. */
function pageProblems(page: DiscoveredStudyPage, context: Context, moduleTitles: ReadonlyMap<string, string>): string[] {
  const found: string[] = [];
  const add = (message: string) => found.push(message);
  const data = page.frontmatter;

  for (const key of required) if (!(key in data)) add(`missing ${key}`);
  for (const key of Object.keys(data)) if (!allowed.has(key)) add(`unknown field ${key}`);
  if (!slug.test(page.folder) || !slug.test(page.slug) || page.id.split('/').length !== 2) {
    add(`file must be content/study/<module>/<page>.md in lowercase words joined by hyphens`);
  }
  if (data.module !== page.folder) add(`module "${String(data.module)}" must match its folder "${page.folder}"`);
  if (!context.modules.has(page.folder)) add(`folder "${page.folder}" has no module file in content/study-modules`);

  if (!isText(data.title)) add('title must be text');
  if (!Number.isInteger(data.order) || (data.order as number) < 1) add('order must be a whole number from 1');
  if (data.level !== 'core' && data.level !== 'extended') add(`level "${String(data.level)}" must be core or extended`);
  const concept = conceptOf(page, context.map, moduleTitles.get(page.folder));
  if (!concept) add(`order ${String(data.order)} matches no concept of "${moduleTitles.get(page.folder)}" in the topic map`);
  else if (data.level !== concept.level) add(`level "${String(data.level)}" differs from topic map ${concept.id}, which is ${concept.level}`);

  if (!isText(data.summary)) add('summary must be text');
  else if (sentences(data.summary).length > 2) add(`summary has ${sentences(data.summary).length} sentences; write at most 2`);

  if (!textList(data.outcomes) || data.outcomes.length < 2 || data.outcomes.length > 4) {
    add(`outcomes needs 2 to 4 text items, has ${Array.isArray(data.outcomes) ? data.outcomes.length : 'none'}`);
  } else {
    data.outcomes.forEach((outcome, index) => { if (!isSentence(outcome)) add(`outcomes[${index}] must be one sentence: "${outcome}"`); });
  }
  for (const key of ['useWhen', 'avoidWhen'] as const) {
    const list = data[key];
    if (!textList(list) || list.length === 0) add(`${key} needs at least one text item`);
    // A comma inside an unquoted [flow, list] splits one item into two; each half then fails here.
    else list.forEach((item, index) => { if (!isSentence(item)) add(`${key}[${index}] must be one sentence: "${item}"`); });
  }

  const words = bodyWords(page.body);
  if (words < 200 || words > 450) add(`body has ${words} words outside code; write 200 to 450`);
  const headingLines = [...withoutFences(page.body).matchAll(/^(#{1,6})[ \t]+(.+?)[ \t#]*$/gm)];
  const sections = headingLines.filter(([, level]) => level.length <= 2).map(([, level, text]) => `${level} ${text.trim()}`);
  const expected = headings.map((heading) => `## ${heading}`);
  if (sections.join('|') !== expected.join('|')) add(`body sections must be ${expected.join(', ')} in order; found ${sections.join(', ') || 'none'}`);
  const examples = Array.isArray(data.examples) ? data.examples : [];
  if ('examples' in data && (examples.length < 1 || examples.length > 2)) add(`examples needs 1 or 2 items, has ${examples.length}`);
  const minutes = Math.ceil(words / 200) + (examples.length ? 1 : 0);
  if (data.minutes !== minutes) add(`minutes is ${String(data.minutes)}; ${words} words${examples.length ? ' and an example' : ''} make ${minutes}`);

  const prerequisites = data.prerequisites ?? [];
  if (!Array.isArray(prerequisites)) add('prerequisites must be a list');
  else {
    for (const id of prerequisites) {
      if (typeof id !== 'string' || !pageId.test(id)) add(`prerequisite "${String(id)}" must be <module>/<page>`);
      else if (id === page.id) add('a page cannot be its own prerequisite');
      else if (!context.modules.has(id.split('/')[0])) add(`prerequisite "${id}" names a module that does not exist`);
    }
  }

  const practice = data.practiceTopics ?? [];
  if (!Array.isArray(practice)) add('practiceTopics must be a list');
  else for (const topic of practice) if (!context.problemTopics.has(topic as string)) add(`practice topic "${String(topic)}" matches no problem`);
  const asked = data.questionTopics ?? [];
  if (!Array.isArray(asked)) add('questionTopics must be a list');
  else {
    for (const topic of asked) {
      if (!questionTopics.includes(topic as never)) add(`question topic "${String(topic)}" is not one of ${questionTopics.join(', ')}`);
      else if (!context.questionCounts.get(topic as string)) add(`question topic "${String(topic)}" has no questions`);
    }
  }

  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (!sources.length) add('sources needs at least one source');
  const listedUrls = new Set<string>();
  sources.forEach((source, index) => {
    if (!isRecord(source) || !isText(source.label) || !isText(source.url) || !['primary', 'practitioner'].includes(source.type as string)) {
      add(`sources[${index}] needs a label, a url and a type of primary or practitioner`);
      return;
    }
    if (listedUrls.has(source.url)) add(`sources[${index}] repeats ${source.url}`);
    listedUrls.add(source.url);
    const types = context.urls.get(source.url);
    if (!types) add(`sources[${index}] ${source.url} is not in .notes/study/topic-map.json`);
    else if (types.size && !types.has(source.type as string)) add(`sources[${index}] is ${String(source.type)}; the topic map calls it ${[...types].join(' or ')}`);
  });
  if (sources.length && !sources.some((source) => isRecord(source) && source.type === 'primary')) add('sources needs at least one primary source');

  if ('whatChanged' in data) {
    const changed = data.whatChanged;
    const checked = isRecord(changed) ? changed.checked : undefined;
    const day = checked instanceof Date ? checked.toISOString().slice(0, 10) : String(checked ?? '');
    if (!isRecord(changed) || !/^\d{4}-\d{2}-\d{2}$/.test(day) || Number.isNaN(Date.parse(day))) add('whatChanged.checked must be a date such as 2026-11-27');
    else if (day > context.today) add(`whatChanged.checked ${day} is in the future`);
    if (!isRecord(changed) || !textList(changed.items) || !changed.items.length) add('whatChanged.items needs at least one text item');
  }

  if ('expertsDisagree' in data) {
    const disputes = data.expertsDisagree;
    if (!Array.isArray(disputes) || !disputes.length) add('expertsDisagree, when present, needs at least one item');
    else disputes.forEach((dispute, index) => {
      const at = `expertsDisagree[${index}]`;
      if (!isRecord(dispute) || !isText(dispute.question)) {
        add(`${at} needs a question`);
        return;
      }
      const positions = Array.isArray(dispute.positions) ? dispute.positions : [];
      if (positions.length < 2) add(`${at} needs at least two positions, has ${positions.length}`);
      positions.forEach((position, place) => {
        if (!isRecord(position) || !isText(position.view) || !isText(position.holdsWhen) || !isText(position.source)) {
          add(`${at}.positions[${place}] needs a view, holdsWhen and source`);
        } else if (!listedUrls.has(position.source)) {
          add(`${at}.positions[${place}] cites ${position.source}, which is not in sources`);
        }
      });
    });
  }
  return found;
}

/** Prerequisite cycles among written pages. A page that is not written yet has no prerequisites. */
function cycleProblems(pages: Array<Pick<DiscoveredStudyPage, 'id' | 'frontmatter'>>): string[] {
  const edges = new Map(pages.map(({ id, frontmatter }) => [id,
    (Array.isArray(frontmatter.prerequisites) ? frontmatter.prerequisites : []).filter((next): next is string => typeof next === 'string')]));
  const state = new Map<string, 'open' | 'done'>();
  const found: string[] = [];
  const visit = (id: string, path: string[]) => {
    if (state.get(id) === 'done') return;
    if (state.get(id) === 'open') {
      found.push(`prerequisite cycle: ${[...path.slice(path.indexOf(id)), id].join(' -> ')}`);
      return;
    }
    state.set(id, 'open');
    for (const next of edges.get(id) ?? []) visit(next, [...path, id]);
    state.set(id, 'done');
  };
  for (const id of edges.keys()) visit(id, []);
  return found;
}

/** Problems with the module files: fields, stage and title against the topic map, and unique orders. */
function moduleProblems(modules: DiscoveredStudyModule[], map: TopicMap): string[] {
  const found: string[] = [];
  const stageOf = new Map(map.meta.stages.flatMap(({ stage, modules: ids }) => ids.map((id) => [id, stage.slice(0, 1)])));
  const orders = new Map<unknown, string>();
  for (const { id, file, data } of modules) {
    const add = (message: string) => found.push(`${file}: ${message}`);
    if (!slug.test(id)) add('file name must be lowercase words joined by hyphens');
    for (const key of Object.keys(data)) if (!['title', 'stage', 'order', 'summary'].includes(key)) add(`unknown field ${key}`);
    if (!isText(data.title)) add('title must be text');
    if (!isText(data.summary)) add('summary must be text');
    else if (sentences(data.summary).length > 2) add(`summary has ${sentences(data.summary).length} sentences; write at most 2`);
    if (!Number.isInteger(data.order)) add('order must be a whole number');
    if (orders.has(data.order)) add(`order ${String(data.order)} is also used by ${orders.get(data.order)}`);
    orders.set(data.order, id);
    const twin = map.modules.find(({ order }) => order === data.order);
    if (!twin) add(`order ${String(data.order)} matches no topic map module`);
    else {
      if (data.title !== twin.module) add(`title "${String(data.title)}" differs from topic map ${twin.id}, "${twin.module}"`);
      if (data.stage !== stageOf.get(twin.id)) add(`stage "${String(data.stage)}" differs from topic map ${twin.id}, stage ${stageOf.get(twin.id)}`);
    }
  }
  if (modules.length !== map.modules.length) found.push(`${modules.length} module files; the topic map has ${map.modules.length}`);
  return found;
}

const map = readTopicMap();
const pages = discoverStudyPages();
const modules = discoverStudyModules();
const questions = discoverQuestions();
const questionCounts = new Map<string, number>();
for (const { folder } of questions) questionCounts.set(folder, (questionCounts.get(folder) ?? 0) + 1);
const context: Context = {
  modules: new Set(modules.map(({ id }) => id)),
  problemTopics: new Set(discoverProblems().map(({ data }) => data.topic)),
  questionCounts,
  urls: topicMapUrls(map),
  map,
  today: new Date().toISOString().slice(0, 10),
};
const moduleTitles = new Map(modules.map(({ id, data }) => [id, String(data.title)]));

describe('Study modules', () => {
  it('match the topic map, one file per module', () => {
    expect(modules.length, 'no files in content/study-modules').toBeGreaterThan(0);
    expect(moduleProblems(modules, map)).toEqual([]);
  });
});

describe('Study pages', () => {
  it('exist, and report what is written per module', () => {
    expect(pages.length, 'no pages in content/study').toBeGreaterThan(0);
    console.log(`Study pages (${pages.length}):\n${modules.map(({ id }) =>
      `  ${id.padEnd(36)} ${pages.filter(({ folder }) => folder === id).length}`).join('\n')}`);
  });

  it.each(pages.map((page) => [page.file, page] as const))('%s follows the authoring rules', (_file, page) => {
    expect(pageProblems(page, context, moduleTitles)).toEqual([]);
  });

  it('use each order once per module', () => {
    const seen = new Map<string, string>();
    const repeats: string[] = [];
    for (const { id, folder, frontmatter } of pages) {
      const key = `${folder}:${String(frontmatter.order)}`;
      if (seen.has(key)) repeats.push(`${id} and ${seen.get(key)} both use order ${String(frontmatter.order)}`);
      seen.set(key, id);
    }
    expect(repeats).toEqual([]);
  });

  it('have prerequisites without cycles, and list the ones not written yet', () => {
    expect(cycleProblems(pages)).toEqual([]);
    const written = new Set(pages.map(({ id }) => id));
    const pending = [...new Set(pages.flatMap(({ frontmatter }) =>
      (Array.isArray(frontmatter.prerequisites) ? frontmatter.prerequisites as string[] : []).filter((id) => !written.has(id))))].sort();
    console.log(`Prerequisites not written yet, shown as text without a link (${pending.length}):\n${pending.map((id) => `  ${id}`).join('\n')}`);
  });

  it.each([...pages.map(({ file }) => file), ...modules.map(({ file }) => file)])('%s follows the plain-language rules', (file) => {
    const findings = scanProse(file, readFileSync(join(root, file), 'utf8')).findings;
    expect(findings.map(({ line, rule, detail }) => `${file}:${line} ${rule}: ${detail}`)).toEqual([]);
  });
});

describe('the Study checks catch planted mistakes', () => {
  const base = pages.find(({ id }) => id === 'framework-design/page-object-model');
  const plant = (frontmatter: Record<string, unknown> = {}, body?: string) => ({
    ...base!,
    frontmatter: { ...base!.frontmatter, ...frontmatter },
    body: body ?? base!.body,
  });
  const problemsOf = (page: DiscoveredStudyPage) => pageProblems(page, context, moduleTitles).join('\n');
  const sentence = (count: number) => `${Array(count).fill('word').join(' ')}.`;
  const bodyOf = (sections: string[], words = 60) => sections.map((heading) => `## ${heading}\n\n${sentence(words)}\n`).join('\n');
  /** The four sections with `total` words in all, the 14 heading words included. */
  const bodyWith = (total: number) => {
    const rest = total - bodyWords(headings.map((heading) => `## ${heading}`).join('\n'));
    return headings.map((heading, index) =>
      `## ${heading}\n\n${sentence(Math.floor(rest / 4) + (index < rest % 4 ? 1 : 0))}\n`).join('\n');
  };

  it('accepts the page object page as written', () => {
    expect(base, 'the page object page').toBeDefined();
    expect(pageProblems(plant(), context, moduleTitles)).toEqual([]);
  });

  it.each([[200, 2], [201, 3], [450, 4]])('accepts a %i-word body with minutes %i', (words, minutes) => {
    expect(base, 'the page object page').toBeDefined();
    expect(bodyWords(bodyWith(words))).toBe(words);
    expect(pageProblems(plant({ minutes }, bodyWith(words)), context, moduleTitles)).toEqual([]);
  });

  it.each([
    ['sections out of order', {}, bodyOf(['What it is', 'Why it helps', 'How it works', 'When not to use it']), 'body sections must be'],
    ['a missing section', {}, bodyOf(['What it is', 'How it works', 'Why it helps']), 'body sections must be'],
    ['an extra section', {}, bodyOf([...headings, 'Summary']), 'body sections must be'],
    ['a 199-word body', { minutes: 2 }, bodyWith(199), 'body has 199 words outside code; write 200 to 450'],
    ['a 451-word body', { minutes: 4 }, bodyWith(451), 'body has 451 words outside code; write 200 to 450'],
    ['minutes that do not match', { minutes: 9 }, undefined, 'minutes is 9'],
    ['a three-sentence summary', { summary: 'One. Two. Three.' }, undefined, 'summary has 3 sentences'],
    ['one outcome', { outcomes: ['Write a page object.'] }, undefined, 'outcomes needs 2 to 4'],
    ['a two-sentence outcome', { outcomes: ['Write it. Then test it.', 'Explain it.'] }, undefined, 'outcomes[0] must be one sentence'],
    ['a useWhen item split by a comma in a flow list', { useWhen: ['Boundary and partition tables', 'role matrices and locale sets.'] }, undefined, 'useWhen[0] must be one sentence'],
    ['a module that does not match the folder', { module: 'playwright' }, undefined, 'must match its folder'],
    ['an order with no topic map concept', { order: 42 }, undefined, 'matches no concept'],
    ['a level that differs from the topic map', { level: 'extended' }, undefined, 'differs from topic map m4-c1'],
    ['a prerequisite in a module that does not exist', { prerequisites: ['cooking/knives'] }, undefined, 'names a module that does not exist'],
    ['a malformed prerequisite', { prerequisites: ['locator-strategy'] }, undefined, 'must be <module>/<page>'],
    ['itself as a prerequisite', { prerequisites: ['framework-design/page-object-model'] }, undefined, 'its own prerequisite'],
    ['a practice topic no problem uses', { practiceTopics: ['knitting'] }, undefined, 'practice topic "knitting" matches no problem'],
    ['an unknown question topic', { questionTopics: ['knitting'] }, undefined, 'question topic "knitting" is not one of'],
    ['a source outside the topic map', { sources: [{ label: 'Blog', url: 'https://example.com/pom', type: 'primary' }] }, undefined, 'is not in .notes/study/topic-map.json'],
    ['a source with the wrong type', { sources: [{ label: 'Fowler', url: 'https://martinfowler.com/bliki/PageObject.html', type: 'primary' }] }, undefined, 'the topic map calls it practitioner'],
    ['no primary source', { sources: [{ label: 'Fowler', url: 'https://martinfowler.com/bliki/PageObject.html', type: 'practitioner' }], expertsDisagree: undefined }, undefined, 'at least one primary source'],
    ['a dispute with one position', { expertsDisagree: [{ question: 'Q?', positions: [{ view: 'A.', holdsWhen: 'B.', source: 'https://playwright.dev/docs/pom' }] }] }, undefined, 'needs at least two positions'],
    ['a dispute citing an unlisted source', { expertsDisagree: [{ question: 'Q?', positions: [
      { view: 'A.', holdsWhen: 'B.', source: 'https://playwright.dev/docs/pom' },
      { view: 'C.', holdsWhen: 'D.', source: 'https://serenity-js.org/handbook/design/screenplay-pattern/' },
    ] }] }, undefined, 'which is not in sources'],
    ['a future check date', { whatChanged: { checked: new Date('2999-01-01'), items: ['A change.'] } }, undefined, 'is in the future'],
    ['a typo in a field name', { usewhen: ['A case.'] }, undefined, 'unknown field usewhen'],
  ])('reports %s', (_name, frontmatter, body, message) => {
    expect(base, 'the page object page').toBeDefined();
    expect(problemsOf(plant(frontmatter as Record<string, unknown>, body))).toContain(message);
  });

  it('counts words outside fenced code, headings included', () => {
    expect(bodyWords('## What it is\n\nOne two.\n\n```ts\nconst a = 1;\n```\n\n~~~\nskip me\n~~~\nThree.')).toBe(6);
  });

  it('finds a prerequisite cycle and ignores pages that are not written', () => {
    const node = (id: string, prerequisites: string[]) => ({ id, frontmatter: { prerequisites } });
    expect(cycleProblems([node('a/one', ['a/two']), node('a/two', ['b/unwritten'])])).toEqual([]);
    expect(cycleProblems([node('a/one', ['a/two']), node('a/two', ['a/three']), node('a/three', ['a/one'])]))
      .toEqual(['prerequisite cycle: a/one -> a/two -> a/three -> a/one']);
  });

  it('reports a module whose stage or title differs from the topic map', () => {
    const [first] = modules;
    expect(first, 'a module file').toBeDefined();
    const stage = first.data.stage === 'A' ? 'D' : 'A';
    const planted = modules.map((module) => module === first ? { ...module, data: { ...module.data, stage, title: 'Renamed' } } : module);
    expect(moduleProblems(planted, map).join('\n')).toMatch(new RegExp(`title "Renamed" differs[\\s\\S]*stage "${stage}" differs`));
    expect(moduleProblems(modules.slice(1), map).join('\n')).toContain(`${modules.length - 1} module files; the topic map has ${map.modules.length}`);
  });
});
