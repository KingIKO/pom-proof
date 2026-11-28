import { url } from './url';

/**
 * The list a learner last saw on Practice. The list URL stays the source of truth for filters;
 * this copy only feeds links on other pages (Previous, Next, the position line, the way back and
 * the header Practice link). It lives in sessionStorage, so each tab keeps its own list.
 */
export const practiceContextKey = 'pom-proof:practice-context';
export const practiceContextEvent = 'pomproof:practice-context';

export interface PracticeContext {
  v: 1;
  /** The list's filter query without the leading `?`, for example `topic=playwright%2Capi`. */
  query: string;
  /** Names the list in links, for example `Playwright, API` or a saved set's name. Empty when nothing filters the list. */
  label: string;
  /** Problem id and title of each listed row, in the order the list shows them. */
  items: [id: string, title: string][];
  /** True while the list shows a saved practice set unchanged. Only the list's own page reads it. */
  savedSet?: boolean;
}

export interface LabelParts {
  q: string;
  topic: readonly string[];
  kind: readonly string[];
  difficulty: readonly string[];
  role: readonly string[];
  status: readonly string[];
}

export interface Neighbour { id: string; title: string }

const problemId = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

let latest: PracticeContext | null = null;

function sessionStore(): Pick<Storage, 'getItem' | 'setItem'> | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * The list's name built from its filter values: topics first, then kind, difficulty, role and
 * status. More than two values become the first two plus a count. A search alone reads `Search “login”`.
 */
export function practiceLabel({ q, topic, kind, difficulty, role, status }: LabelParts) {
  const values = [...topic, ...kind, ...difficulty, ...role, ...status];
  const search = q.trim();
  if (search) values.push(`Search “${search}”`);
  if (values.length > 2) return `${values[0]}, ${values[1]} and ${values.length - 2} more`;
  return values.join(', ');
}

/** The stored value, or null when it is missing or not in the expected shape. */
export function decodePracticeContext(raw: string | null): PracticeContext | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const { v, query, label, items } = value as Record<string, unknown>;
  if (v !== 1 || typeof query !== 'string' || typeof label !== 'string' || !Array.isArray(items)) return null;
  const valid = items.every((item): item is [string, string] => Array.isArray(item) && item.length === 2
    && typeof item[0] === 'string' && problemId.test(item[0]) && typeof item[1] === 'string');
  if (!valid) return null;
  // Re-encoding keeps the query a plain query string whatever was stored.
  return { v: 1, query: new URLSearchParams(query).toString(), label, items };
}

export function readPracticeContext(store = sessionStore()): PracticeContext | null {
  try {
    return decodePracticeContext(store?.getItem(practiceContextKey) ?? null);
  } catch {
    return null;
  }
}

/** Stores the list for this tab and tells the page's other parts. The event still fires when storage is blocked. */
export function writePracticeContext(context: Omit<PracticeContext, 'v'>, store = sessionStore()) {
  const value: PracticeContext = { v: 1, ...context };
  latest = value;
  try {
    store?.setItem(practiceContextKey, JSON.stringify(value));
  } catch {
    // Without storage, links on other pages keep their built targets.
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(practiceContextEvent, { detail: value }));
  return value;
}

/** The list written last on this page, if any. */
export function latestPracticeContext() {
  return latest;
}

/** Where a problem sits in the list, or null when the list does not hold it. */
export function practicePlace({ items }: PracticeContext, id: string) {
  const index = items.findIndex(([item]) => item === id);
  if (index < 0) return null;
  const at = (offset: number): Neighbour | undefined => {
    const item = items[index + offset];
    return item && { id: item[0], title: item[1] };
  };
  return { position: index + 1, total: items.length, previous: index > 0 ? at(-1) : undefined, next: at(1) };
}

/**
 * The problem to point at when the one a learner came back from has left the list: the next one
 * from the earlier list that is still shown, or else the closest shown one before it.
 */
export function nearestShown({ items }: PracticeContext, id: string, shown: (id: string) => boolean) {
  const index = items.findIndex(([item]) => item === id);
  if (index < 0) return undefined;
  const after = items.slice(index + 1).find(([item]) => shown(item));
  const before = items.slice(0, index).reverse().find(([item]) => shown(item));
  return (after ?? before)?.[0];
}

/** The list row's element id, `row-<kind>-<slug>`. */
export function practiceRowId(id: string) {
  return `row-${id.replace('/', '-')}`;
}

/** The Practice list with the given query, scrolled to the problem's row when an id is given. */
export function practiceListHref(query = '', id?: string) {
  return `${url('/')}${query ? `?${query}` : ''}${id ? `#${practiceRowId(id)}` : ''}`;
}
