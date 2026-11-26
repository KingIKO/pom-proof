import { describe, expect, it } from 'vitest';
import { progressStorageKey, type ProgressAttempt } from '../../src/lib/contracts';
import { createProgressStore } from '../../src/lib/progress';
import type { CardState } from '../../src/lib/review';

// The export carries review state next to attempts (the brief's review queue decision, applied
// from 2E's proposal): export includes it, import restores it, invalid review data is refused
// without writing anything, and an older export without review leaves current review state alone.
const reviewKey = 'pom-proof:review';
const attempt: ProgressAttempt = { problemId: 'bug-report/refund-duplicate-receipts', completedAt: '2026-11-26T09:00:00.000Z', score: 1 };
const solid: CardState = { box: 1, due: '2026-11-27T09:00:00.000Z', seen: 1, last: 'solid' };
const missed: CardState = { box: 0, due: '2026-11-26T09:10:00.000Z', seen: 2, last: 'missed' };

function memoryStorage(initial: Record<string, string> = {}, failOn?: string) {
  const items = new Map(Object.entries(initial));
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (key === failOn) throw new Error('QuotaExceededError');
      items.set(key, value);
    },
  };
}

const progressJson = (attempts: ProgressAttempt[]) => JSON.stringify({ version: 1, attempts });

describe('progress export', () => {
  it('includes the stored review cards next to the attempts', () => {
    const storage = memoryStorage({ [progressStorageKey]: progressJson([attempt]), [reviewKey]: JSON.stringify({ 'api/put-vs-patch': solid }) });
    expect(JSON.parse(createProgressStore(storage).exportJson())).toEqual({
      version: 1, attempts: [attempt], review: { 'api/put-vs-patch': solid },
    });
  });

  it('exports an empty review when nothing has been rated', () => {
    const storage = memoryStorage({ [progressStorageKey]: progressJson([attempt]) });
    expect(JSON.parse(createProgressStore(storage).exportJson())).toEqual({ version: 1, attempts: [attempt], review: {} });
  });
});

describe('progress import', () => {
  it('restores the review cards and the attempts from an export', () => {
    const source = memoryStorage({ [progressStorageKey]: progressJson([attempt]), [reviewKey]: JSON.stringify({ 'api/put-vs-patch': solid, 'agile/release-go-no-go': missed }) });
    const target = memoryStorage({ [reviewKey]: JSON.stringify({ 'fundamentals/test-levels': solid }) });
    const result = createProgressStore(target).importJson(createProgressStore(source).exportJson());
    expect(result).toEqual({ ok: true, snapshot: { version: 1, attempts: [attempt] } });
    expect(JSON.parse(target.items.get(reviewKey)!)).toEqual({ 'api/put-vs-patch': solid, 'agile/release-go-no-go': missed });
    expect(JSON.parse(target.items.get(progressStorageKey)!)).toEqual({ version: 1, attempts: [attempt] });
  });

  it.each([
    ['a box above 4', { 'api/put-vs-patch': { ...solid, box: 5 } }],
    ['a due date that is not a date', { 'api/put-vs-patch': { ...solid, due: 'tomorrow' } }],
    ['a card never seen', { 'api/put-vs-patch': { ...solid, seen: 0 } }],
    ['an unknown rating', { 'api/put-vs-patch': { ...solid, last: 'great' } }],
    ['a card that is not an object', { 'api/put-vs-patch': 'solid' }],
    ['a list instead of cards', [solid]],
    ['null', null],
  ])('refuses review data with %s and writes nothing', (_name, review) => {
    const before = { [progressStorageKey]: progressJson([]), [reviewKey]: JSON.stringify({ 'fundamentals/test-levels': solid }) };
    const storage = memoryStorage(before);
    const result = createProgressStore(storage).importJson(JSON.stringify({ version: 1, attempts: [attempt], review }));
    expect(result).toEqual({ ok: false, message: expect.stringContaining('review data is invalid') });
    expect(Object.fromEntries(storage.items)).toEqual(before);
  });

  it('keeps the current review cards when an older export has no review', () => {
    const current = JSON.stringify({ 'fundamentals/test-levels': solid });
    const storage = memoryStorage({ [progressStorageKey]: progressJson([]), [reviewKey]: current });
    const result = createProgressStore(storage).importJson(progressJson([attempt]));
    expect(result).toEqual({ ok: true, snapshot: { version: 1, attempts: [attempt] } });
    expect(storage.items.get(reviewKey)).toBe(current);
    expect(JSON.parse(storage.items.get(progressStorageKey)!)).toEqual({ version: 1, attempts: [attempt] });
  });

  it('puts the review cards back when saving the attempts fails', () => {
    const current = JSON.stringify({ 'fundamentals/test-levels': solid });
    const storage = memoryStorage({ [reviewKey]: current }, progressStorageKey);
    const result = createProgressStore(storage).importJson(JSON.stringify({ version: 1, attempts: [attempt], review: { 'api/put-vs-patch': missed } }));
    expect(result).toEqual({ ok: false, message: expect.stringContaining('could not be saved') });
    expect(storage.items.get(reviewKey)).toBe(current);
    expect(storage.items.has(progressStorageKey)).toBe(false);
  });
});
