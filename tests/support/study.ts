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
  id: string;
  module: string;
  order: number;
  level: string;
  concept: string;
  sources: Array<{ url: string; type: string }>;
}

export interface TopicMap {
  modules: Array<{ id: string; order: number; module: string }>;
  meta: { stages: Array<{ stage: string; modules: string[] }> };
  concepts: TopicMapConcept[];
}

export function readTopicMap(): TopicMap {
  return JSON.parse(readFileSync(join(root, '.notes', 'study', 'topic-map.json'), 'utf8')) as TopicMap;
}

/** Every URL anywhere in the topic map, with the source types the map gives it (empty when untyped). */
export function topicMapUrls(map: unknown = readTopicMap()) {
  const urls = new Map<string, Set<string>>();
  const visit = (value: unknown) => {
    if (typeof value === 'string') {
      if (/^https?:\/\//.test(value) && !urls.has(value)) urls.set(value, new Set());
    } else if (Array.isArray(value)) {
      value.forEach(visit);
    } else if (value && typeof value === 'object') {
      const { url, type } = value as { url?: unknown; type?: unknown };
      if (typeof url === 'string' && typeof type === 'string') {
        urls.set(url, (urls.get(url) ?? new Set()).add(type));
      }
      Object.values(value).forEach(visit);
    }
  };
  visit(map);
  return urls;
}
