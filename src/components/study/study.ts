import { getCollection, type CollectionEntry } from 'astro:content';
import { url } from '../../lib/url';
import { questionListUrl, questionTopics, withParams } from '../questions/questions';
import { formatDay } from './read-state';

type PageEntry = CollectionEntry<'study'>;
type ModuleEntry = CollectionEntry<'studyModules'>;
type Stage = ModuleEntry['data']['stage'];

export const stages = [
  { id: 'A', name: 'Foundations', label: 'A. Foundations' },
  { id: 'B', name: 'Automation craft', label: 'B. Automation craft' },
  { id: 'C', name: 'Tools', label: 'C. Tools' },
  { id: 'D', name: 'Running at scale and beyond', label: 'D. Running at scale and beyond' },
] as const satisfies readonly { id: Stage; name: string; label: string }[];

export interface StudyPageSummary {
  /** Collection id and read-state key, `<module>/<page>`. */
  id: string;
  module: string;
  title: string;
  summary: string;
  minutes: number;
  level: PageEntry['data']['level'];
}

export interface StudyModule {
  id: string;
  title: string;
  stage: Stage;
  summary: string;
  pages: StudyPageSummary[];
  minutes: number;
}

export interface Prerequisite {
  id: string;
  title: string;
  moduleTitle: string;
  href: string;
}

export const studyHomeUrl = url('/study/');
export const studyModuleUrl = (module: string) => url(`/study/${module}/`);
export const studyPageUrl = (id: string) => url(`/study/${id}/`);

export const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
export const levelLabel = { core: 'core topic', extended: 'extended topic' } as const;

const fail = (message: string): never => {
  throw new Error(message);
};

function checkPage(page: PageEntry, moduleIds: ReadonlySet<string>) {
  const [folder, slug, ...extra] = page.id.split('/');
  if (!slug || extra.length) fail(`Study page "${page.id}" must sit at content/study/<module>/<page>.md`);
  if (page.data.module !== folder) fail(`Study page "${page.id}" sets module "${page.data.module}" but sits in the "${folder}" folder`);
  if (!moduleIds.has(folder)) fail(`Study page "${page.id}" is in "${folder}", which has no file in content/study-modules`);
  if (!page.body?.trim()) fail(`Study page "${page.id}" needs a Markdown body`);
  const sources = new Set(page.data.sources.map(({ url: href }) => href));
  for (const { question, positions } of page.data.expertsDisagree ?? []) {
    for (const source of positions.flatMap((position) => position.source)) {
      if (!sources.has(source)) fail(`Study page "${page.id}": the source ${source} in "${question}" must also be listed in sources`);
    }
  }
  for (const prerequisite of page.data.prerequisites) {
    if (prerequisite === page.id) fail(`Study page "${page.id}" lists itself as a prerequisite`);
    const [module] = prerequisite.split('/');
    if (!moduleIds.has(module)) fail(`Study page "${page.id}" needs "${prerequisite}", whose module "${module}" does not exist`);
  }
}

/**
 * Modules in their order, each with its written pages in order, plus every page in reading order.
 * Throws on a page outside its module folder, a repeated order value, or a dispute citing a
 * source the page does not list, so a broken page fails the build.
 */
export async function studyCatalog() {
  const [moduleEntries, pageEntries] = await Promise.all([getCollection('studyModules'), getCollection('study')]);
  const moduleIds = new Set(moduleEntries.map(({ id }) => id));
  for (const page of pageEntries) checkPage(page, moduleIds);

  const moduleOrders = new Map<number, string>();
  for (const { id, data } of moduleEntries) {
    const taken = moduleOrders.get(data.order);
    if (taken) fail(`Study modules "${taken}" and "${id}" both use order ${data.order}`);
    moduleOrders.set(data.order, id);
  }

  const modules: StudyModule[] = moduleEntries.sort((a, b) => a.data.order - b.data.order).map(({ id, data }) => {
    const entries = pageEntries.filter((page) => page.data.module === id).sort((a, b) => a.data.order - b.data.order);
    entries.forEach((page, index) => {
      const next = entries[index + 1];
      if (next?.data.order === page.data.order) fail(`Study pages "${page.id}" and "${next.id}" both use order ${page.data.order}`);
    });
    const pages = entries.map((page) => ({
      id: page.id,
      module: id,
      title: page.data.title,
      summary: page.data.summary,
      minutes: page.data.minutes,
      level: page.data.level,
    }));
    return {
      id,
      title: data.title,
      stage: data.stage,
      summary: data.summary,
      pages,
      minutes: pages.reduce((total, page) => total + page.minutes, 0),
    };
  });
  const pages = modules.flatMap((module) => module.pages);
  const entries = new Map(pageEntries.map((page) => [page.id, page]));
  return { modules, pages, entries };
}

/**
 * The prerequisites whose pages are written, as links. One that is not written yet is left out;
 * the Study content test lists those in its log.
 */
export function prerequisitesOf(page: PageEntry, modules: readonly StudyModule[]): Prerequisite[] {
  return page.data.prerequisites.flatMap((id) => {
    const module = modules.find((candidate) => candidate.id === id.split('/')[0]);
    const written = module?.pages.find((candidate) => candidate.id === id);
    return module && written ? [{ id, title: written.title, moduleTitle: module.title, href: studyPageUrl(id) }] : [];
  });
}

/** The "Practice this" links: matching problems as one filtered list, and each question topic. */
export async function practiceLinks(page: PageEntry) {
  const [problems, questions] = await Promise.all([getCollection('problems'), getCollection('questions')]);
  const topics = page.data.practiceTopics;
  const problemCount = problems.filter(({ data }) => topics.includes(data.topic)).length;
  return {
    problems: problemCount ? { href: `${url('/')}?topic=${topics.join(',')}`, count: problemCount } : undefined,
    questions: page.data.questionTopics.map((topic) => ({
      topic,
      label: questionTopics[topic],
      href: withParams(questionListUrl, new URLSearchParams({ topic })),
      count: questions.filter(({ data }) => data.topic === topic).length,
    })).filter(({ count }) => count > 0),
  };
}

const entities: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Frontmatter text as HTML: escaped, with `backtick` spans shown as code. */
export const inline = (text: string) => text
  .replace(/[&<>"']/g, (character) => entities[character])
  .replace(/`([^`]+)`/g, '<code>$1</code>');

/** A checked date as "27 Nov 2026", read in UTC so the build time zone cannot move it. */
export const checkedDate = (date: Date) => formatDay(date.toISOString().slice(0, 10));
