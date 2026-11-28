import { progressStorageKey, type CreateProgressStore, type ProgressAttempt, type ProgressSnapshot } from './contracts';
import { decodePracticeSets, noPracticeSets, practiceSetsKey, type PracticeSets } from './practice-sets';
import type { CardState } from './review';

const reviewStorageKey = 'pom-proof:review';
const empty = (): ProgressSnapshot => ({ version: 1, attempts: [] });
const failure = (message: string) => ({ ok: false as const, message });

type ReviewSnapshot = Record<string, CardState>;
type Decoded =
  | { ok: true; snapshot: ProgressSnapshot; review?: ReviewSnapshot; sets?: PracticeSets }
  | ReturnType<typeof failure>;

function decodeReview(value: unknown): ReviewSnapshot | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return;
  const entries: [string, CardState][] = [];
  for (const [id, card] of Object.entries(value)) {
    if (!id.trim() || typeof card !== 'object' || card === null || Array.isArray(card)) return;
    const { box, due, seen, last } = card as Partial<CardState>;
    if (
      typeof box !== 'number' || !Number.isInteger(box) || box < 0 || box > 4 ||
      typeof due !== 'string' || !Number.isFinite(Date.parse(due)) ||
      typeof seen !== 'number' || !Number.isSafeInteger(seen) || seen <= 0 ||
      (last !== 'missed' && last !== 'shaky' && last !== 'solid')
    ) return;
    entries.push([id, { box, due, seen, last }]);
  }
  return Object.fromEntries(entries);
}

function decode(json: string): Decoded {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    return failure('The file is not valid JSON, the format POM Proof uses for exports. Choose a POM Proof export.');
  }
  if (!value || typeof value !== 'object' || !('version' in value)) {
    return failure('The file does not say which progress format it uses. Choose a POM Proof export.');
  }
  if (value.version !== 1) {
    return failure('This file uses an unsupported progress format. Choose a version 1 export.');
  }
  if (!('attempts' in value) || !Array.isArray(value.attempts)) {
    return failure('The file is missing a list of attempts. Choose a POM Proof export.');
  }

  const attempts: ProgressAttempt[] = [];
  for (const [index, attempt] of value.attempts.entries()) {
    if (!attempt || typeof attempt !== 'object') {
      return failure(`Attempt ${index + 1} has the wrong format. Choose a POM Proof export.`);
    }
    const { problemId, completedAt, score } = attempt;
    if (
      typeof problemId !== 'string' || !problemId.trim() ||
      typeof completedAt !== 'string' || !Number.isFinite(Date.parse(completedAt)) ||
      typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > 1
    ) {
      return failure(`Attempt ${index + 1} needs a problem ID, a valid date, and a score from 0 to 1.`);
    }
    attempts.push({ problemId, completedAt, score });
  }
  const review = 'review' in value ? decodeReview(value.review) : undefined;
  if ('review' in value && review === undefined) {
    return failure('The review data is invalid. Choose a POM Proof export.');
  }
  // Practice sets are optional too: exports from before sets existed import as before.
  const sets = 'sets' in value ? decodePracticeSets(value.sets) : undefined;
  if ('sets' in value && sets === undefined) {
    return failure('The practice set data is invalid. Choose a POM Proof export.');
  }
  return { ok: true, snapshot: { version: 1, attempts }, review, sets };
}

/**
 * The saved practice sets for an export. Left out when this browser never saved a set, or when the
 * stored value is damaged, so importing the file elsewhere keeps the sets there.
 */
function exportedSets(storage: Pick<Storage, 'getItem'>) {
  const stored = storage.getItem(practiceSetsKey);
  if (stored === null) return undefined;
  try {
    return decodePracticeSets(JSON.parse(stored));
  } catch {
    return undefined;
  }
}

export const createProgressStore = ((storage) => {
  const read = () => {
    const stored = storage.getItem(progressStorageKey);
    if (stored === null) return empty();
    const decoded = decode(stored);
    return decoded.ok ? decoded.snapshot : empty();
  };
  const write = (snapshot: ProgressSnapshot) => storage.setItem(progressStorageKey, JSON.stringify(snapshot));

  return {
    read,
    record(attempt) {
      const snapshot = read();
      snapshot.attempts.push(attempt);
      write(snapshot);
    },
    exportJson() {
      const stored = storage.getItem(reviewStorageKey);
      let review: ReviewSnapshot | undefined;
      try {
        review = decodeReview(JSON.parse(stored ?? '{}'));
      } catch {
        review = undefined;
      }
      return JSON.stringify({ ...read(), review, sets: exportedSets(storage) }, null, 2);
    },
    importJson(json) {
      const decoded = decode(json);
      if (!decoded.ok) return decoded;
      // Review cards and sets the file leaves out stay as they are. When one write fails, the ones
      // before it are put back, so a failed import changes nothing.
      const writes: [key: string, value: string, empty: string][] = [];
      if (decoded.sets !== undefined) writes.push([practiceSetsKey, JSON.stringify(decoded.sets), JSON.stringify(noPracticeSets())]);
      if (decoded.review !== undefined) writes.push([reviewStorageKey, JSON.stringify(decoded.review), '{}']);
      writes.push([progressStorageKey, JSON.stringify(decoded.snapshot), JSON.stringify(empty())]);
      const done: [key: string, previous: string][] = [];
      try {
        for (const [key, value, blank] of writes) {
          const previous = storage.getItem(key) ?? blank;
          storage.setItem(key, value);
          done.push([key, previous]);
        }
      } catch {
        for (const [key, previous] of done.reverse()) {
          try {
            storage.setItem(key, previous);
          } catch {
            // Nothing more can be put back.
          }
        }
        return failure('Progress could not be saved. Check your browser’s storage settings and try again.');
      }
      return { ok: true as const, snapshot: decoded.snapshot, sets: decoded.sets?.sets.length };
    },
  };
}) satisfies CreateProgressStore;

const progressEvent = 'pomproof:progress';

export function readProgress(): ProgressSnapshot {
  try {
    return createProgressStore(window.localStorage).read();
  } catch {
    return empty();
  }
}

export function notifyProgressChange() {
  window.dispatchEvent(new Event(progressEvent));
}

export function onProgressChange(update: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === progressStorageKey || event.key === null) update();
  };
  window.addEventListener(progressEvent, update);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(progressEvent, update);
    window.removeEventListener('storage', onStorage);
  };
}

export function bestScores(attempts: readonly ProgressAttempt[]) {
  const scores = new Map<string, number>();
  for (const { problemId, score } of attempts) scores.set(problemId, Math.max(scores.get(problemId) ?? 0, score));
  return scores;
}
