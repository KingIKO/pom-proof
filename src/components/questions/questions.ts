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
} satisfies Record<Question['topic'], string>;

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
