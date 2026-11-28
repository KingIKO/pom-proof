import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parseFrontmatter } from '@astrojs/internal-helpers/frontmatter';
import { parse as parseYaml } from 'yaml';
import { root } from './problems';
import type { QuestionExample } from './questions';

export interface DiscoveredStudyModule {
  /** Module slug, the file name without `.yaml`. */
  id: string;
  file: string;
  data: Record<string, unknown>;
}

export interface DiscoveredStudyPage {
  /** Collection id and read-state key, for example `framework-design/page-object-model`. */
  id: string;
  folder: string;
  slug: string;
  /** Page path relative to the `/pom-proof/` base URL. */
  path: string;
  file: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

const listed = (folder: string, extension: string) => {
  const base = join(root, 'content', folder);
  return readdirSync(base, { recursive: true, encoding: 'utf8' })
    .filter((file) => file.endsWith(extension))
    .sort()
    .map((file) => ({ base, file, id: file.slice(0, -extension.length).split(sep).join('/') }));
};

export function discoverStudyModules(): DiscoveredStudyModule[] {
  return listed('study-modules', '.yaml').map(({ base, file, id }) => ({
    id,
    file: relative(root, join(base, file)).split(sep).join('/'),
    data: (parseYaml(readFileSync(join(base, file), 'utf8')) ?? {}) as Record<string, unknown>,
  }));
}

/**
 * Reads every Study page with the frontmatter parser the Astro loader uses, unvalidated, so the
 * Study test checks the plan's rules independently of the collection schema.
 */
export function discoverStudyPages(): DiscoveredStudyPage[] {
  return listed('study', '.md').map(({ base, file, id }) => {
    const { frontmatter, content } = parseFrontmatter(readFileSync(join(base, file), 'utf8'));
    const [folder = '', slug = ''] = id.split('/');
    return {
      id,
      folder,
      slug,
      path: `study/${id}/`,
      file: relative(root, join(base, file)).split(sep).join('/'),
      frontmatter: frontmatter as Record<string, unknown>,
      body: content,
    };
  });
}

/** The `examples` field as written, unvalidated. */
export function studyExamples(page: DiscoveredStudyPage): QuestionExample[] {
  const { examples } = page.frontmatter;
  return Array.isArray(examples) ? examples as QuestionExample[] : [];
}

/** Study module paths with at least one written page, relative to the base URL. */
export function studyModulePaths(pages = discoverStudyPages()) {
  return [...new Set(pages.map(({ folder }) => `study/${folder}/`))];
}

export interface TopicMapConcept {
  /** Map id such as `m4-c1`; prerequisites name these. */
  id: string;
  /** The page's file name, so the page is `content/study/<module slug>/<slug>.md`. */
  slug: string;
  module: string;
  order: number;
  level: string;
  concept: string;
  prerequisites: string[];
  sources: Array<{ url: string; type: string }>;
}

export interface TopicMapModule {
  id: string;
  /** The module's folder and file name in content/study and content/study-modules. */
  slug: string;
  order: number;
  module: string;
}

export interface TopicMap {
  modules: TopicMapModule[];
  meta: { stages: Array<{ stage: string; modules: string[] }> };
  concepts: TopicMapConcept[];
}

export function readTopicMap(): TopicMap {
  return JSON.parse(readFileSync(join(root, '.notes', 'study', 'topic-map.json'), 'utf8')) as TopicMap;
}

/** The planned pages by id, `<module slug>/<concept slug>`, as the map lists them. */
export function plannedPages(map: TopicMap = readTopicMap()) {
  const moduleSlug = new Map(map.modules.map(({ module, slug }) => [module, slug]));
  return new Map(map.concepts.map((concept) => [`${moduleSlug.get(concept.module)}/${concept.slug}`, concept]));
}

/**
 * The URLs a page may cite: those in `concepts[].sources`, each with the type the map gives it.
 * Links elsewhere in the map, such as `existing_guides` or disagreement notes, do not count.
 */
export function topicMapUrls(map: TopicMap = readTopicMap()) {
  const urls = new Map<string, Set<string>>();
  for (const { sources } of map.concepts) {
    for (const { url, type } of sources) urls.set(url, (urls.get(url) ?? new Set()).add(type));
  }
  return urls;
}
