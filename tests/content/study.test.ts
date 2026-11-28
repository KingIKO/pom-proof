import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { normalizeProse, scanProse, sentencesOf } from '../support/plain-language';
import { discoverProblems, root } from '../support/problems';
import { discoverQuestions, questionTopics } from '../support/questions';
import {
  discoverStudyModules, discoverStudyPages, plannedPages, readTopicMap, topicMapUrls,
  type DiscoveredStudyModule, type DiscoveredStudyPage, type TopicMap, type TopicMapConcept,
} from '../support/study';

/**
 * The Study authoring rules (practice and study plan, sections 3 and 4), checked from the files
 * and independently of the collection schema: page shape, word limits and the minutes formula,
 * a planned slug and prerequisites that agree with the topic map, practice and question topics
 * that match real content, sources from the map's concepts, a recap that does not repeat the
 * body, and the plain-language rules on every Study file.
 */

const headings = ['What it is', 'How it works', 'Why it helps', 'When not to use it'];
const required = ['title', 'module', 'order', 'level', 'summary', 'minutes', 'outcomes', 'useWhen', 'avoidWhen', 'sources'];
const allowed = new Set([...required, 'prerequisites', 'practiceTopics', 'questionTopics', 'examples', 'whatChanged', 'expertsDisagree']);
const slug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const pageId = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** A recap item may share at most this many words in a row with the body. */
const sharedLimit = 4;

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

/** Lowercase words without punctuation or code marks, for comparing wording. */
const wordsOf = (text: string) => text.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];

/** The first run of more than `sharedLimit` words that `item` takes from the body, if any. */
function sharedRun(item: string, body: string) {
  const prose = ` ${wordsOf(withoutFences(body)).join(' ')} `;
  const words = wordsOf(item);
  for (let start = 0; start + sharedLimit < words.length; start += 1) {
    const run = words.slice(start, start + sharedLimit + 1).join(' ');
    if (prose.includes(` ${run} `)) return run;
  }
  return undefined;
}

interface Context {
  modules: ReadonlySet<string>;
  /** Planned pages by id, `<module slug>/<concept slug>`. */
  planned: ReadonlyMap<string, TopicMapConcept>;
  /** Planned page ids by map concept id, such as `m4-c1`. */
  pageOfConcept: ReadonlyMap<string, string>;
  problemTopics: ReadonlySet<string>;
  questionCounts: ReadonlyMap<string, number>;
  urls: ReadonlyMap<string, ReadonlySet<string>>;
  today: string;
}

/** Problems with one page, each naming the field and what is wrong. */
function pageProblems(page: DiscoveredStudyPage, context: Context): string[] {
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
  // The file name is the concept's slug. `order` only sorts pages, so it is not compared.
  const concept = context.planned.get(page.id);
  if (!concept) {
    add(`"${page.id}" is not a planned page: give it a concept with slug "${page.slug}" in the ${page.folder} module of .notes/study/topic-map.json`);
  } else if (data.level !== concept.level) {
    add(`level "${String(data.level)}" differs from topic map ${concept.id}, which is ${concept.level}`);
  }

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
    else {
      list.forEach((item, index) => {
        // A comma inside an unquoted [flow, list] splits one item into two; each half then fails here.
        if (!isSentence(item)) add(`${key}[${index}] must be one sentence: "${item}"`);
        const run = sharedRun(item, page.body);
        if (run) add(`${key}[${index}] repeats "${run}" from the body; write the recap in other words`);
      });
    }
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
    const planned = (concept?.prerequisites ?? []).map((id) => context.pageOfConcept.get(id) ?? id);
    for (const id of prerequisites) {
      if (typeof id !== 'string' || !pageId.test(id)) add(`prerequisite "${String(id)}" must be <module>/<page>`);
      else if (id === page.id) add('a page cannot be its own prerequisite');
      else if (!context.planned.has(id)) add(`prerequisite "${id}" is not a planned page in .notes/study/topic-map.json`);
      else if (concept && !planned.includes(id)) {
        add(`prerequisite "${id}" is not among ${concept.id}'s prerequisites in the topic map: ${planned.join(', ') || 'none'}`);
      }
    }
    if (concept) {
      for (const id of planned) if (!prerequisites.includes(id)) add(`prerequisites leave out ${id}, which the topic map lists for ${concept.id}`);
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
    if (!types) add(`sources[${index}] ${source.url} is not in a concept's sources in .notes/study/topic-map.json`);
    else if (!types.has(source.type as string)) add(`sources[${index}] is ${String(source.type)}; the topic map calls it ${[...types].join(' or ')}`);
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
        // `source` is one URL, or a list when a view rests on more than one source.
        const cited = isRecord(position) && isText(position.source) ? [position.source] : isRecord(position) ? position.source : undefined;
        if (!isRecord(position) || !isText(position.view) || !isText(position.holdsWhen) || !textList(cited) || !cited.length) {
          add(`${at}.positions[${place}] needs a view, holdsWhen and at least one source`);
        } else {
          for (const url of cited) if (!listedUrls.has(url)) add(`${at}.positions[${place}] cites ${url}, which is not in sources`);
        }
      });
    });
  }
  return found;
}

/** Prerequisite cycles. A node that is not in `nodes`, such as an unwritten page, has no prerequisites. */
function cycleProblems(nodes: Array<{ id: string; prerequisites: unknown }>): string[] {
  const edges = new Map(nodes.map(({ id, prerequisites }) => [id,
    (Array.isArray(prerequisites) ? prerequisites : []).filter((next): next is string => typeof next === 'string')]));
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

/** Problems with the map itself: slugs, prerequisites that exist and do not loop, one type per source. */
function mapProblems(map: TopicMap): string[] {
  const found: string[] = [];
  const moduleSlugs = new Set<string>();
  for (const { id, slug: name } of map.modules) {
    if (!slug.test(name ?? '')) found.push(`module ${id} needs a slug of lowercase words joined by hyphens`);
    if (moduleSlugs.has(name)) found.push(`module slug "${name}" is used twice`);
    moduleSlugs.add(name);
  }
  const ids = new Set(map.concepts.map(({ id }) => id));
  const pageIds = new Set<string>();
  for (const page of plannedPages(map).keys()) pageIds.add(page);
  if (pageIds.size !== map.concepts.length) found.push(`${map.concepts.length} concepts give only ${pageIds.size} distinct pages; a slug repeats within a module`);
  for (const { id, slug: name, module, prerequisites } of map.concepts) {
    if (!slug.test(name ?? '')) found.push(`concept ${id} needs a slug of lowercase words joined by hyphens`);
    if (!map.modules.some((candidate) => candidate.module === module)) found.push(`concept ${id} names module "${module}", which the map does not list`);
    for (const needed of prerequisites) if (!ids.has(needed)) found.push(`concept ${id} needs ${needed}, which the map does not list`);
  }
  found.push(...cycleProblems(map.concepts));
  for (const [url, types] of topicMapUrls(map)) if (types.size > 1) found.push(`${url} is both ${[...types].join(' and ')}`);
  return found;
}

/** Problems with the module files: fields, and order, stage and title against the map module of the same slug. */
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
    const twin = map.modules.find(({ slug: name }) => name === id);
    if (!twin) add(`file name "${id}" matches no module slug in the topic map`);
    else {
      if (data.order !== twin.order) add(`order ${String(data.order)} differs from topic map ${twin.id}, order ${twin.order}`);
      if (data.title !== twin.module) add(`title "${String(data.title)}" differs from topic map ${twin.id}, "${twin.module}"`);
      if (data.stage !== stageOf.get(twin.id)) add(`stage "${String(data.stage)}" differs from topic map ${twin.id}, stage ${stageOf.get(twin.id)}`);
    }
  }
  if (modules.length !== map.modules.length) found.push(`${modules.length} module files; the topic map has ${map.modules.length}`);
  return found;
}

const map = readTopicMap();
const planned = plannedPages(map);
const pages = discoverStudyPages();
const modules = discoverStudyModules();
const questions = discoverQuestions();
const questionCounts = new Map<string, number>();
for (const { folder } of questions) questionCounts.set(folder, (questionCounts.get(folder) ?? 0) + 1);
const context: Context = {
  modules: new Set(modules.map(({ id }) => id)),
  planned,
  pageOfConcept: new Map([...planned].map(([id, concept]) => [concept.id, id])),
  problemTopics: new Set(discoverProblems().map(({ data }) => data.topic)),
  questionCounts,
  urls: topicMapUrls(map),
  today: new Date().toISOString().slice(0, 10),
};

describe('the Study topic map', () => {
  it('gives every module and concept a slug, with prerequisites that exist and do not loop', () => {
    expect(map.concepts.length, 'concepts in the map').toBeGreaterThan(0);
    expect(mapProblems(map)).toEqual([]);
  });
});

describe('Study modules', () => {
  it('match the topic map, one file per module', () => {
    expect(modules.length, 'no files in content/study-modules').toBeGreaterThan(0);
    expect(moduleProblems(modules, map)).toEqual([]);
  });
});

describe('Study pages', () => {
  it('exist, and report what is written per module', () => {
    expect(pages.length, 'no pages in content/study').toBeGreaterThan(0);
    console.log(`Study pages (${pages.length} of ${planned.size} planned):\n${modules.map(({ id }) =>
      `  ${id.padEnd(36)} ${pages.filter(({ folder }) => folder === id).length}`).join('\n')}`);
  });

  it.each(pages.map((page) => [page.file, page] as const))('%s follows the authoring rules', (_file, page) => {
    expect(pageProblems(page, context)).toEqual([]);
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
    expect(cycleProblems(pages.map(({ id, frontmatter }) => ({ id, prerequisites: frontmatter.prerequisites })))).toEqual([]);
    const written = new Set(pages.map(({ id }) => id));
    const pending = [...new Set(pages.flatMap(({ frontmatter }) =>
      (Array.isArray(frontmatter.prerequisites) ? frontmatter.prerequisites as string[] : []).filter((id) => !written.has(id))))].sort();
    console.log(`Prerequisites not written yet, left out of Read first (${pending.length}):\n${pending.map((id) => `  ${id}`).join('\n')}`);
  });

  it.each([...pages.map(({ file }) => file), ...modules.map(({ file }) => file)])('%s follows the plain-language rules', (file) => {
    const findings = scanProse(file, readFileSync(join(root, file), 'utf8')).findings;
    expect(findings.map(({ line, rule, detail }) => `${file}:${line} ${rule}: ${detail}`)).toEqual([]);
  });
});

describe('the Study checks catch planted mistakes', () => {
  const base = pages.find(({ id }) => id === 'framework-design/page-object-model');
  const plant = (frontmatter: Record<string, unknown> = {}, body?: string, file?: { folder: string; slug: string }) => ({
    ...base!,
    ...(file ? { ...file, id: `${file.folder}/${file.slug}` } : {}),
    frontmatter: { ...base!.frontmatter, ...frontmatter },
    body: body ?? base!.body,
  });
  const problemsOf = (page: DiscoveredStudyPage) => pageProblems(page, context).join('\n');
  const sentence = (count: number) => `${Array(count).fill('word').join(' ')}.`;
  const bodyOf = (sections: string[], words = 60) => sections.map((heading) => `## ${heading}\n\n${sentence(words)}\n`).join('\n');
  /** The four sections with `total` words in all, the 14 heading words included. */
  const bodyWith = (total: number) => {
    const rest = total - bodyWords(headings.map((heading) => `## ${heading}`).join('\n'));
    return headings.map((heading, index) =>
      `## ${heading}\n\n${sentence(Math.floor(rest / 4) + (index < rest % 4 ? 1 : 0))}\n`).join('\n');
  };
  const guideOnly = ((readTopicMap() as unknown as { existing_guides: Array<{ url: string }> }).existing_guides)
    .map(({ url }) => url).find((url) => !context.urls.has(url));

  it('accepts the page object page as written', () => {
    expect(base, 'the page object page').toBeDefined();
    expect(pageProblems(plant(), context)).toEqual([]);
  });

  it.each([[200, 2], [201, 3], [450, 4]])('accepts a %i-word body with minutes %i', (words, minutes) => {
    expect(base, 'the page object page').toBeDefined();
    expect(bodyWords(bodyWith(words))).toBe(words);
    expect(pageProblems(plant({ minutes }, bodyWith(words)), context)).toEqual([]);
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
    ['a recap that repeats the body', { minutes: 3, avoidWhen: ['Several tests open the same checkout screen.'] },
      bodyWith(300).replace('## How it works\n\n', '## How it works\n\nSeveral tests open the same checkout screen. '),
      'avoidWhen[0] repeats "several tests open the same" from the body'],
    ['a module that does not match the folder', { module: 'playwright' }, undefined, 'must match its folder'],
    ['a level that differs from the topic map', { level: 'extended' }, undefined, 'differs from topic map m4-c1'],
    ['a prerequisite that is not a planned page', { prerequisites: ['automation-fundamentals/knives'] }, undefined, 'is not a planned page'],
    ['a malformed prerequisite', { prerequisites: ['locator-strategy'] }, undefined, 'must be <module>/<page>'],
    ['itself as a prerequisite', { prerequisites: ['framework-design/page-object-model'] }, undefined, 'its own prerequisite'],
    ['a planned prerequisite the map does not give', { prerequisites: ['automation-fundamentals/locator-strategy', 'test-design/defect-reports'] },
      undefined, `prerequisite "test-design/defect-reports" is not among m4-c1's prerequisites`],
    ['a map prerequisite the page leaves out', { prerequisites: [] }, undefined, 'leave out automation-fundamentals/locator-strategy'],
    ['a practice topic no problem uses', { practiceTopics: ['knitting'] }, undefined, 'practice topic "knitting" matches no problem'],
    ['an unknown question topic', { questionTopics: ['knitting'] }, undefined, 'question topic "knitting" is not one of'],
    ['a source outside the topic map', { sources: [{ label: 'Blog', url: 'https://example.com/pom', type: 'primary' }] }, undefined, 'is not in a concept\'s sources'],
    ['a source the map lists only as a guide', { sources: [{ label: 'Guide', url: guideOnly, type: 'primary' }] }, undefined, 'is not in a concept\'s sources'],
    ['a source with the wrong type', { sources: [{ label: 'Fowler', url: 'https://martinfowler.com/bliki/PageObject.html', type: 'primary' }] }, undefined, 'the topic map calls it practitioner'],
    ['no primary source', { sources: [{ label: 'Fowler', url: 'https://martinfowler.com/bliki/PageObject.html', type: 'practitioner' }], expertsDisagree: undefined }, undefined, 'at least one primary source'],
    ['a dispute with one position', { expertsDisagree: [{ question: 'Q?', positions: [{ view: 'A.', holdsWhen: 'B.', source: 'https://playwright.dev/docs/pom' }] }] }, undefined, 'needs at least two positions'],
    ['a dispute citing an unlisted source', { expertsDisagree: [{ question: 'Q?', positions: [
      { view: 'A.', holdsWhen: 'B.', source: 'https://playwright.dev/docs/pom' },
      { view: 'C.', holdsWhen: 'D.', source: 'https://serenity-js.org/handbook/design/screenplay-pattern/' },
    ] }] }, undefined, 'cites https://serenity-js.org/handbook/design/screenplay-pattern/, which is not in sources'],
    ['an unlisted source in a list of sources', { expertsDisagree: [{ question: 'Q?', positions: [
      { view: 'A.', holdsWhen: 'B.', source: ['https://playwright.dev/docs/pom', 'https://example.com/other'] },
      { view: 'C.', holdsWhen: 'D.', source: 'https://playwright.dev/docs/pom' },
    ] }] }, undefined, 'positions[0] cites https://example.com/other, which is not in sources'],
    ['a position with an empty source list', { expertsDisagree: [{ question: 'Q?', positions: [
      { view: 'A.', holdsWhen: 'B.', source: [] },
      { view: 'C.', holdsWhen: 'D.', source: 'https://playwright.dev/docs/pom' },
    ] }] }, undefined, 'positions[0] needs a view, holdsWhen and at least one source'],
    ['a future check date', { whatChanged: { checked: new Date('2999-01-01'), items: ['A change.'] } }, undefined, 'is in the future'],
    ['a typo in a field name', { usewhen: ['A case.'] }, undefined, 'unknown field usewhen'],
  ])('reports %s', (_name, frontmatter, body, message) => {
    expect(base, 'the page object page').toBeDefined();
    expect(problemsOf(plant(frontmatter as Record<string, unknown>, body))).toContain(message);
  });

  it('reports a page whose file name is not a planned slug, and ignores its order', () => {
    expect(base, 'the page object page').toBeDefined();
    expect(problemsOf(plant({}, undefined, { folder: 'framework-design', slug: 'page-objects' })))
      .toContain('"framework-design/page-objects" is not a planned page: give it a concept with slug "page-objects"');
    expect(pageProblems(plant({ order: 42 }), context)).toEqual([]);
  });

  it('counts words outside fenced code, headings included', () => {
    expect(bodyWords('## What it is\n\nOne two.\n\n```ts\nconst a = 1;\n```\n\n~~~\nskip me\n~~~\nThree.')).toBe(6);
  });

  it('allows four shared words in a row and reports five', () => {
    expect(sharedRun('Tests open the same screen.', 'Several tests open the same checkout screen.')).toBeUndefined();
    expect(sharedRun('When tests open the same checkout.', 'Several tests open the same checkout screen.')).toBe('tests open the same checkout');
    expect(sharedRun('Code is not counted here.', 'Prose.\n\n```\ncode is not counted here\n```')).toBeUndefined();
  });

  it('finds a prerequisite cycle and ignores pages that are not written', () => {
    const node = (id: string, prerequisites: string[]) => ({ id, prerequisites });
    expect(cycleProblems([node('a/one', ['a/two']), node('a/two', ['b/unwritten'])])).toEqual([]);
    expect(cycleProblems([node('a/one', ['a/two']), node('a/two', ['a/three']), node('a/three', ['a/one'])]))
      .toEqual(['prerequisite cycle: a/one -> a/two -> a/three -> a/one']);
  });

  it('reports map slugs that are missing or repeated, and a source with two types', () => {
    const [first, second] = map.concepts;
    const planted: TopicMap = {
      ...map,
      concepts: [{ ...first, slug: '' }, { ...second, slug: map.concepts[2].slug },
        { ...map.concepts[2], sources: [...map.concepts[2].sources, { ...second.sources[0], type: second.sources[0].type === 'primary' ? 'practitioner' : 'primary' }] },
        ...map.concepts.slice(3)],
    };
    const found = mapProblems(planted).join('\n');
    expect(found).toContain(`concept ${first.id} needs a slug`);
    expect(found).toContain('a slug repeats within a module');
    expect(found).toContain(`${second.sources[0].url} is both`);
  });

  it('reports a module whose stage, title or file name differs from the topic map', () => {
    const [first] = modules;
    expect(first, 'a module file').toBeDefined();
    const stage = first.data.stage === 'A' ? 'D' : 'A';
    const planted = modules.map((module) => module === first ? { ...module, data: { ...module.data, stage, title: 'Renamed' } } : module);
    expect(moduleProblems(planted, map).join('\n')).toMatch(new RegExp(`title "Renamed" differs[\\s\\S]*stage "${stage}" differs`));
    const renamed = modules.map((module) => module === first ? { ...module, id: 'renamed-module' } : module);
    expect(moduleProblems(renamed, map).join('\n')).toContain('file name "renamed-module" matches no module slug');
    expect(moduleProblems(modules.slice(1), map).join('\n')).toContain(`${modules.length - 1} module files; the topic map has ${map.modules.length}`);
  });
});
