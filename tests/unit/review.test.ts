import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { progressStorageKey } from '../../src/lib/contracts';
import { cardState, dueIds, rate, reviewSnapshot, type CardState } from '../../src/lib/review';

// Expectations come from the Phase 2 brief (Leitner days per box 0, 1, 3, 7, 16; a missed card
// returns in 10 minutes; storage key pom-proof:review) and 2E's stated rules (a first solid goes
// to box 1; shaky keeps the current box).
const key = 'pom-proof:review';
const minute = 60_000;
const day = 24 * 60 * minute;
const now = new Date('2026-11-26T09:00:00.000Z');
const at = (offset: number) => new Date(now.getTime() + offset);
const iso = (offset: number) => at(offset).toISOString();

let storage: Map<string, string>;

beforeEach(() => {
  storage = new Map();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (name: string) => storage.get(name) ?? null,
      setItem: (name: string, value: string) => void storage.set(name, String(value)),
      removeItem: (name: string) => void storage.delete(name),
    },
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** Rates a card up to `box` with solids a day apart, returning the time of the last rating. */
function climb(id: string, box: number) {
  let time = now.getTime();
  for (let step = 0; step < box; step += 1) {
    const card = rate(id, 'solid', new Date(time));
    time = Date.parse(card.due);
  }
  return time;
}

describe('rate', () => {
  it('starts with no card for an unseen question', () => {
    expect(cardState('api/put-vs-patch')).toBeUndefined();
    expect(reviewSnapshot()).toEqual({});
  });

  it('moves a first solid card to box 1, due one day later', () => {
    const card = rate('api/put-vs-patch', 'solid', now);
    expect(card).toEqual<CardState>({ box: 1, due: iso(day), seen: 1, last: 'solid' });
    expect(cardState('api/put-vs-patch')).toEqual(card);
  });

  it.each([
    [1, 2, 3], [2, 3, 7], [3, 4, 16], [4, 4, 16],
  ])('moves a solid card from box %i to box %i, due %i days later', (from, box, days) => {
    const time = climb('api/put-vs-patch', from);
    expect(cardState('api/put-vs-patch')?.box).toBe(from);
    expect(rate('api/put-vs-patch', 'solid', new Date(time))).toMatchObject({ box, due: new Date(time + days * day).toISOString() });
  });

  it.each([0, 1, 3, 4])('returns a missed card from box %i to box 0, due in 10 minutes', (from) => {
    const time = climb('api/put-vs-patch', from);
    expect(rate('api/put-vs-patch', 'missed', new Date(time))).toMatchObject({
      box: 0, due: new Date(time + 10 * minute).toISOString(), last: 'missed',
    });
  });

  it.each([
    [0, 0], [1, 1], [2, 3], [3, 7], [4, 16],
  ])('keeps a shaky card in box %i, due %i days later', (from, days) => {
    const time = climb('api/put-vs-patch', from);
    expect(rate('api/put-vs-patch', 'shaky', new Date(time))).toMatchObject({
      box: from, due: new Date(time + days * day).toISOString(), last: 'shaky',
    });
  });

  it('counts every rating of a card and keeps cards apart', () => {
    rate('api/put-vs-patch', 'missed', now);
    rate('api/put-vs-patch', 'shaky', at(11 * minute));
    rate('agile/release-go-no-go', 'solid', now);
    expect(cardState('api/put-vs-patch')).toMatchObject({ seen: 2, last: 'shaky' });
    expect(cardState('agile/release-go-no-go')).toMatchObject({ seen: 1, box: 1 });
  });

  it('stores cards under pom-proof:review and leaves progress alone', () => {
    storage.set(progressStorageKey, '{"version":1,"attempts":[]}');
    rate('api/put-vs-patch', 'solid', now);
    expect(JSON.parse(storage.get(key)!)).toEqual({ 'api/put-vs-patch': { box: 1, due: iso(day), seen: 1, last: 'solid' } });
    expect(storage.get(progressStorageKey)).toBe('{"version":1,"attempts":[]}');
    expect([...storage.keys()].sort()).toEqual([key, progressStorageKey].sort());
  });

  it('starts over from damaged storage instead of failing', () => {
    storage.set(key, '{not json');
    expect(reviewSnapshot()).toEqual({});
    expect(rate('api/put-vs-patch', 'solid', now)).toMatchObject({ box: 1, seen: 1 });
  });
});

describe('reviewSnapshot', () => {
  it('returns every stored card and drops malformed ones', () => {
    const good: CardState = { box: 2, due: iso(3 * day), seen: 2, last: 'solid' };
    storage.set(key, JSON.stringify({
      'api/put-vs-patch': good,
      'api/box-too-high': { ...good, box: 5 },
      'api/bad-date': { ...good, due: 'tomorrow' },
      'api/never-seen': { ...good, seen: 0 },
      'api/bad-rating': { ...good, last: 'great' },
      'api/not-a-card': 'solid',
    }));
    expect(reviewSnapshot()).toEqual({ 'api/put-vs-patch': good });
  });

  it.each(['[]', 'null', '"text"'])('returns no cards when storage holds %s', (stored) => {
    storage.set(key, stored);
    expect(reviewSnapshot()).toEqual({});
  });
});

describe('dueIds', () => {
  const ids = ['a/unseen-one', 'a/due-later', 'a/not-due', 'a/unseen-two', 'a/due-first'];

  it('lists due cards first, earliest due first, then unseen cards in the given order, and leaves out cards not yet due', () => {
    rate('a/due-later', 'missed', now);              // due at +10 min
    rate('a/due-first', 'missed', at(-5 * minute));  // due at +5 min
    rate('a/not-due', 'solid', now);                 // due at +1 day
    expect(dueIds(ids, at(10 * minute))).toEqual(['a/due-first', 'a/due-later', 'a/unseen-one', 'a/unseen-two']);
  });

  it('counts a card due exactly now as due', () => {
    rate('a/due-later', 'missed', now);
    expect(dueIds(['a/due-later'], at(10 * minute))).toEqual(['a/due-later']);
    expect(dueIds(['a/due-later'], at(10 * minute - 1))).toEqual([]);
  });

  it('lists only unseen cards when nothing is due', () => {
    rate('a/not-due', 'solid', now);
    expect(dueIds(ids, now)).toEqual(['a/unseen-one', 'a/due-later', 'a/unseen-two', 'a/due-first']);
  });

  it('ignores stored cards outside the given ids and lists a repeated id once', () => {
    rate('b/elsewhere', 'missed', at(-day));
    expect(dueIds(['a/unseen-one', 'a/unseen-one'], now)).toEqual(['a/unseen-one']);
  });

  it('returns nothing for no ids', () => {
    rate('a/due-first', 'missed', at(-day));
    expect(dueIds([], now)).toEqual([]);
  });
});
