import { progressStorageKey, type CreateProgressStore, type ProgressAttempt, type ProgressSnapshot, type ProgressStore } from './contracts';
import type { CardState } from './review';

const reviewStorageKey = 'pom-proof:review';
const empty = (): ProgressSnapshot => ({ version: 1, attempts: [] });
const failure = (message: string) => ({ ok: false as const, message });

type ReviewSnapshot = Record<string, CardState>;
type Decoded = ReturnType<ProgressStore['importJson']> & { review?: ReviewSnapshot };

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
    return failure('The file is not valid JSON; choose a POM Proof export.');
  }
  if (!value || typeof value !== 'object' || !('version' in value)) {
    return failure('The file has no progress version; choose a POM Proof export.');
  }
  if (value.version !== 1) {
    return failure('This progress version is unsupported; choose a version 1 export.');
  }
  if (!('attempts' in value) || !Array.isArray(value.attempts)) {
    return failure('The progress file has no attempts list; choose a POM Proof export.');
  }

  const attempts: ProgressAttempt[] = [];
  for (const [index, attempt] of value.attempts.entries()) {
    if (!attempt || typeof attempt !== 'object') {
      return failure(`Attempt ${index + 1} is invalid; choose a POM Proof export.`);
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
    return failure('The review data is invalid; choose a POM Proof export.');
  }
  return { ok: true, snapshot: { version: 1, attempts }, review };
}

export const createProgressStore: CreateProgressStore = (storage) => {
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
      return JSON.stringify({ ...read(), review }, null, 2);
    },
    importJson(json) {
      const decoded = decode(json);
      if (!decoded.ok) return decoded;
      try {
        if (decoded.review === undefined) {
          write(decoded.snapshot);
        } else {
          const previous = storage.getItem(reviewStorageKey);
          storage.setItem(reviewStorageKey, JSON.stringify(decoded.review));
          try {
            write(decoded.snapshot);
          } catch (error) {
            storage.setItem(reviewStorageKey, previous ?? '{}');
            throw error;
          }
        }
      } catch {
        return failure('Progress could not be saved; check this browser’s storage settings and try again.');
      }
      return { ok: true, snapshot: decoded.snapshot };
    },
  };
};

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
