/**
 * Which Study pages this browser has marked as read. localStorage `pom-proof:study` holds
 * `{ version: 1, read: { "<module>/<page>": "YYYY-MM-DD" } }`. The ids are word slugs, so moving a
 * page in its module keeps its mark.
 */
export const studyKey = 'pom-proof:study';
export const studyChangeEvent = 'pomproof:study';

export type ReadMap = Record<string, string>;

const pageId = /^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9]+(?:-[a-z0-9]+)*$/;
const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;

function validDate(value: unknown): value is string {
  const match = typeof value === 'string' ? isoDate.exec(value) : null;
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

/** The read marks in a stored value. Anything malformed reads as nothing read; bad entries are dropped. */
export function decodeStudy(raw: string | null | undefined): ReadMap {
  let value: unknown;
  try {
    value = JSON.parse(raw ?? 'null');
  } catch {
    return {};
  }
  if (!value || typeof value !== 'object' || (value as { version?: unknown }).version !== 1) return {};
  const read = (value as { read?: unknown }).read;
  if (!read || typeof read !== 'object' || Array.isArray(read)) return {};
  return Object.fromEntries(Object.entries(read).filter(([id, date]) => pageId.test(id) && validDate(date)));
}

export function encodeStudy(read: ReadMap) {
  return JSON.stringify({ version: 1, read });
}

/** True when a later version of the site wrote the value, which this page must leave alone. */
export function isNewerStudy(raw: string | null | undefined) {
  try {
    const value: unknown = JSON.parse(raw ?? 'null');
    const version = value && typeof value === 'object' ? (value as { version?: unknown }).version : undefined;
    return typeof version === 'number' && version > 1;
  } catch {
    return false;
  }
}

export function readStudy(): ReadMap {
  try {
    return decodeStudy(window.localStorage.getItem(studyKey));
  } catch {
    return {};
  }
}

export type StudyStorage = 'ready' | 'blocked' | 'newer';
const probeKey = 'pom-proof:study-probe';

/**
 * Whether this page can save read marks: `blocked` when the browser refuses storage, `newer` when
 * a later version of the site saved them in a form this page must not overwrite.
 */
export function studyStorage(): StudyStorage {
  try {
    const storage = window.localStorage;
    if (isNewerStudy(storage.getItem(studyKey))) return 'newer';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return 'ready';
  } catch {
    return 'blocked';
  }
}

/** Today in the reader's time zone as YYYY-MM-DD. */
export function localDate(now = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Marks or unmarks one page. Throws when the browser does not save, or when a later version of
 * the site wrote the stored value, so the caller can say so and nothing is overwritten.
 */
export function setRead(id: string, read: boolean, today = localDate()) {
  const storage = window.localStorage;
  const raw = storage.getItem(studyKey);
  if (isNewerStudy(raw)) throw new Error('Read marks were saved by a newer version of the site');
  const marks = decodeStudy(raw);
  if (read) marks[id] = today;
  else delete marks[id];
  storage.setItem(studyKey, encodeStudy(marks));
  window.dispatchEvent(new CustomEvent(studyChangeEvent));
}

/** Runs `update` when this tab or another one changes the marks, and after a back-forward restore. */
export function onStudyChange(update: () => void) {
  window.addEventListener(studyChangeEvent, update);
  window.addEventListener('storage', (event) => {
    if (event.key === studyKey || event.key === null) update();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) update();
  });
}

// A fixed English table: the site is English only, and Intl's en-GB short month differs by ICU
// version ("Sep" or "Sept"), which would make the label change between browsers.
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-11-27" as "27 Nov", with the year added when it is not `thisYear`. */
export function formatDay(iso: string, thisYear?: number) {
  const [year, month, day] = iso.split('-').map(Number);
  const text = `${day} ${months[month - 1]}`;
  return year === thisYear ? text : `${text} ${year}`;
}
