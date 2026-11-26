import { progressStorageKey, type CreateProgressStore, type ProgressAttempt, type ProgressSnapshot, type ProgressStore } from './contracts';

const empty = (): ProgressSnapshot => ({ version: 1, attempts: [] });
const failure = (message: string) => ({ ok: false as const, message });

function decode(json: string): ReturnType<ProgressStore['importJson']> {
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
  return { ok: true, snapshot: { version: 1, attempts } };
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
    exportJson: () => JSON.stringify(read(), null, 2),
    importJson(json) {
      const decoded = decode(json);
      if (!decoded.ok) return decoded;
      try {
        write(decoded.snapshot);
      } catch {
        return failure('Progress could not be saved; check this browser’s storage settings and try again.');
      }
      return decoded;
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
