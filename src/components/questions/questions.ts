import type { CollectionEntry } from 'astro:content';
import { url } from '../../lib/url';

type Question = CollectionEntry<'questions'>['data'];
export const questionTopics = {
  fundamentals: 'Fundamentals',
  'test-design': 'Test design',
  'bug-reports': 'Bug reports',
  agile: 'Agile',
  'automation-strategy': 'Automation strategy',
  'locators-waits': 'Locators and waits',
  'flaky-tests': 'Flaky tests',
  playwright: 'Playwright',
  selenium: 'Selenium',
  api: 'API',
  'ci-git-docker': 'CI, Git and Docker',
  behavioral: 'Behavioral',
  leadership: 'Leadership',
  'framework-design': 'Framework design',
  bdd: 'BDD',
  cypress: 'Cypress',
  performance: 'Performance',
  security: 'Security',
  'ai-testing': 'AI testing',
  'system-design': 'System design',
  sql: 'SQL',
  java: 'Java',
  python: 'Python',
  'javascript-typescript': 'JavaScript and TypeScript',
  containers: 'Docker and Kubernetes',
} satisfies Record<Question['topic'], string>;

type Topic = Question['topic'];
type TopicGroup = { label: string; topics: readonly Topic[] };
const groups = [
  { label: 'Testing', topics: ['fundamentals', 'test-design', 'bug-reports', 'agile', 'bdd'] },
  {
    label: 'Automation',
    topics: ['automation-strategy', 'framework-design', 'locators-waits', 'flaky-tests', 'playwright', 'selenium', 'cypress'],
  },
  { label: 'API and data', topics: ['api', 'sql'] },
  { label: 'Languages', topics: ['javascript-typescript', 'python', 'java'] },
  { label: 'Delivery', topics: ['ci-git-docker', 'containers'] },
  { label: 'Specialist', topics: ['performance', 'security', 'system-design', 'ai-testing'] },
  { label: 'People', topics: ['behavioral', 'leadership'] },
] as const satisfies readonly TopicGroup[];

type GroupedTopics<T extends readonly TopicGroup[]> =
  T extends readonly [infer First extends TopicGroup, ...infer Rest extends TopicGroup[]]
    ? [...First['topics'], ...GroupedTopics<Rest>]
    : [];
type EachTopicOnce<T extends readonly Topic[], Remaining extends Topic = Topic> =
  T extends readonly [infer First extends Topic, ...infer Rest extends Topic[]]
    ? First extends Remaining ? EachTopicOnce<Rest, Exclude<Remaining, First>> : false
    : [Remaining] extends [never] ? true : false;

export const topicGroups: EachTopicOnce<GroupedTopics<typeof groups>> extends true ? typeof groups : never = groups;

export const questionLevels = {
  junior: 'Junior',
  mid: 'Mid',
  senior: 'Senior',
} satisfies Record<Question['level'], string>;

export const questionTypes = {
  concept: 'Concept',
  scenario: 'Scenario',
  behavioral: 'Behavioral',
  tooling: 'Tooling',
} satisfies Record<Question['type'], string>;

export const questionRoles = {
  'manual-qa': 'Manual QA',
  automation: 'Automation',
  sdet: 'SDET',
  senior: 'Senior',
} satisfies Record<Question['roles'][number], string>;

export const ratings = [
  { key: '1', id: 'missed', label: 'Missed' },
  { key: '2', id: 'shaky', label: 'Shaky' },
  { key: '3', id: 'solid', label: 'Solid' },
] as const;

export const filterNames = ['q', 'topic', 'role', 'level', 'type'] as const;
export const questionListUrl = url('/questions/');
export const questionSearchUrl = url('/questions/search.json');

export function questionFragmentUrl(id: string) {
  return url(`/questions/fragments/${id}/`);
}

export function questionUrl(id: string) {
  return url(`/questions/${id}/`);
}

export function filterParams(search: URLSearchParams) {
  const params = new URLSearchParams();
  for (const name of filterNames) {
    const value = search.get(name);
    if (value) params.set(name, value);
  }
  return params;
}

export function withParams(href: string, params: URLSearchParams) {
  return params.size ? `${href}?${params}` : href;
}

const sessionKey = 'pom-proof:review-session';
const questionId = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function startSession(ids: string[], filters: URLSearchParams) {
  if (!ids.length) return;
  const params = new URLSearchParams(filters);
  try {
    window.sessionStorage.setItem(sessionKey, JSON.stringify(ids));
    params.set('review', '1');
  } catch {
    // Start with one question when session storage is unavailable.
  }
  window.location.assign(withParams(questionUrl(ids[0]), params));
}

export function remainingSession(id: string) {
  try {
    const stored: unknown = JSON.parse(window.sessionStorage.getItem(sessionKey) ?? '[]');
    if (Array.isArray(stored) && stored.every((item): item is string =>
      typeof item === 'string' && questionId.test(item))) {
      const index = stored.indexOf(id);
      if (index >= 0) return stored.slice(index + 1);
    }
  } catch {
    return [];
  }
  return [];
}
