import { describe, expect, it } from 'vitest';
import { progressStorageKey, type ProgressAttempt } from '../../src/lib/contracts';
import {
  addPracticeSet, changePracticeSet, checkSetName, choosePracticeSet, decodePracticeSets, deletePracticeSet,
  findMatchingSet, noPracticeSets, practiceSetsKey, readPracticeSets, writePracticeSets, type PracticeSet, type PracticeSets,
} from '../../src/lib/practice-sets';
import { createProgressStore } from '../../src/lib/progress';

// Expectations come from section 2 of .notes/practice-study-plan.md: the stored shape
// { version: 1, activeId, sets: [{ id, name, query, createdAt }] }, names trimmed to 1 to 40
// characters with no duplicates, and an optional `sets` field in exports that older files lack.
const reviewKey = 'pom-proof:review';
const playwright: PracticeSet = { id: 'mf3k2a-000001', name: 'Playwright and API', query: 'topic=playwright%2Capi', createdAt: '2026-11-27T09:00:00.000Z' };
const sql: PracticeSet = { id: 'mf3k2a-000002', name: 'SQL drills', query: 'kind=sql&difficulty=easy', createdAt: '2026-11-27T09:05:00.000Z' };
const stored: PracticeSets = { version: 1, activeId: playwright.id, sets: [playwright, sql] };
const attempt: ProgressAttempt = { problemId: 'bug-report/refund-duplicate-receipts', completedAt: '2026-11-26T09:00:00.000Z', score: 1 };

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

describe('decodePracticeSets', () => {
  it('decodes a well-formed value', () => {
    expect(decodePracticeSets(stored)).toEqual(stored);
  });

  it('trims names, re-encodes queries and drops an active id that names no set', () => {
    expect(decodePracticeSets({ version: 1, activeId: 'gone', sets: [{ ...playwright, name: '  Playwright and API ', query: '?topic=playwright,api' }] }))
      .toEqual({ version: 1, activeId: null, sets: [playwright] });
  });

  it('reads a missing active id as no active set', () => {
    expect(decodePracticeSets({ version: 1, sets: [] })).toEqual(noPracticeSets());
  });

  it.each([
    ['null', null],
    ['a list', [playwright]],
    ['another version', { ...stored, version: 2 }],
    ['sets that are not a list', { ...stored, sets: {} }],
    ['an active id that is not text', { ...stored, activeId: 3 }],
    ['a set that is not an object', { ...stored, sets: ['Playwright'] }],
    ['a set id with other characters', { ...stored, sets: [{ ...playwright, id: '../x' }] }],
    ['two sets with one id', { ...stored, sets: [playwright, { ...sql, id: playwright.id }] }],
    ['an empty name', { ...stored, sets: [{ ...playwright, name: '   ' }] }],
    ['a name of 41 characters', { ...stored, sets: [{ ...playwright, name: 'x'.repeat(41) }] }],
    ['two sets with one name in different case', { ...stored, sets: [playwright, { ...sql, name: 'playwright AND api' }] }],
    ['a query that is not text', { ...stored, sets: [{ ...playwright, query: ['topic=api'] }] }],
    ['a date that is not a date', { ...stored, sets: [{ ...playwright, createdAt: 'today' }] }],
  ])('refuses a value with %s', (_name, value) => {
    expect(decodePracticeSets(value)).toBeUndefined();
  });
});

describe('set names', () => {
  it('trims the name and allows 1 to 40 characters', () => {
    expect(checkSetName('  Playwright  ', [])).toEqual({ ok: true, name: 'Playwright' });
    expect(checkSetName('x'.repeat(40), [])).toEqual({ ok: true, name: 'x'.repeat(40) });
    expect(checkSetName('   ', [])).toEqual({ ok: false, message: 'Enter a name for the set.' });
    expect(checkSetName('x'.repeat(41), [])).toEqual({ ok: false, message: 'Use 40 characters or fewer. This name has 41.' });
  });

  it('refuses a name another set uses, ignoring case and spaces at the ends', () => {
    const duplicate = { ok: false, message: 'A set with this name exists. Choose another name.' };
    expect(checkSetName('Playwright and API', stored.sets)).toEqual(duplicate);
    expect(checkSetName(' playwright AND api ', stored.sets)).toEqual(duplicate);
  });

  it('lets a set keep its own name when renamed', () => {
    expect(checkSetName('playwright and api', stored.sets, playwright.id)).toEqual({ ok: true, name: 'playwright and api' });
    expect(checkSetName('SQL drills', stored.sets, playwright.id)).toMatchObject({ ok: false });
  });
});

describe('changing sets', () => {
  it('adds a set and makes it the active one', () => {
    const now = new Date('2026-11-27T10:00:00.000Z');
    expect(addPracticeSet(noPracticeSets(), ' Locators ', 'kind=locator', { id: 'abc-1', now })).toEqual({
      version: 1, activeId: 'abc-1', sets: [{ id: 'abc-1', name: 'Locators', query: 'kind=locator', createdAt: now.toISOString() }],
    });
  });

  it('gives each new set its own id', () => {
    const first = addPracticeSet(noPracticeSets(), 'One', 'kind=sql');
    const second = addPracticeSet(first, 'Two', 'kind=code');
    expect(second.sets[0].id).not.toBe(second.sets[1].id);
    expect(decodePracticeSets(second)).toEqual(second);
  });

  it('renames and updates one set and leaves the others', () => {
    const renamed = changePracticeSet(stored, sql.id, { name: ' SQL basics ' });
    expect(renamed.sets).toEqual([playwright, { ...sql, name: 'SQL basics' }]);
    const updated = changePracticeSet(stored, playwright.id, { query: 'topic=playwright' });
    expect(updated.sets).toEqual([{ ...playwright, query: 'topic=playwright' }, sql]);
    expect(updated.activeId).toBe(playwright.id);
  });

  it('clears the active set when it is deleted and keeps it when another one is', () => {
    expect(deletePracticeSet(stored, playwright.id)).toEqual({ version: 1, activeId: null, sets: [sql] });
    expect(deletePracticeSet(stored, sql.id)).toEqual({ version: 1, activeId: playwright.id, sets: [playwright] });
  });

  it('chooses a saved set or all problems', () => {
    expect(choosePracticeSet(stored, sql.id).activeId).toBe(sql.id);
    expect(choosePracticeSet(stored, null).activeId).toBeNull();
    expect(choosePracticeSet(stored, 'gone').activeId).toBeNull();
  });
});

describe('finding the set that holds some filters', () => {
  const holds = (query: string) => (set: PracticeSet) => set.query === query;

  it('finds the active set when an older set holds the same filters', () => {
    // Set B, saved after A, is updated to A's filters and stays active, as Update set leaves it.
    const a = addPracticeSet(noPracticeSets(), 'Set A', 'topic=playwright', { id: 'a-000001' });
    const both = addPracticeSet(a, 'Set B', 'topic=playwright%2Capi', { id: 'b-000002' });
    const updated = changePracticeSet(both, 'b-000002', { query: 'topic=playwright' });
    expect(updated.activeId).toBe('b-000002');
    expect(findMatchingSet(updated, holds('topic=playwright'))?.name).toBe('Set B');
  });

  it('prefers the active set, then the set the tab has chosen, then the first saved', () => {
    const third: PracticeSet = { ...sql, id: 'mf3k2a-000003', name: 'SQL again' };
    const twins: PracticeSets = { version: 1, activeId: null, sets: [sql, third] };
    expect(findMatchingSet(twins, holds(sql.query))?.id).toBe(sql.id);
    expect(findMatchingSet(twins, holds(sql.query), third.id)?.id).toBe(third.id);
    expect(findMatchingSet({ ...twins, activeId: third.id }, holds(sql.query), sql.id)?.id).toBe(third.id);
    // An active set that does not hold the filters is passed over.
    expect(findMatchingSet({ ...twins, activeId: playwright.id, sets: [playwright, ...twins.sets] }, holds(sql.query))?.id).toBe(sql.id);
    expect(findMatchingSet(twins, holds('topic=none'), sql.id)).toBeUndefined();
  });
});

describe('stored sets', () => {
  it('reads none when nothing or a damaged value is stored', () => {
    expect(readPracticeSets(memoryStorage())).toEqual(noPracticeSets());
    expect(readPracticeSets(memoryStorage({ [practiceSetsKey]: '{not json' }))).toEqual(noPracticeSets());
    expect(readPracticeSets(memoryStorage({ [practiceSetsKey]: JSON.stringify({ version: 2 }) }))).toEqual(noPracticeSets());
  });

  it('reads null when storage is missing or throws, so the set row hides', () => {
    expect(readPracticeSets(null)).toBeNull();
    const blocked = { getItem: () => { throw new DOMException('blocked', 'SecurityError'); }, setItem: () => {} };
    expect(readPracticeSets(blocked)).toBeNull();
  });

  it('writes and reads back the same sets, and reports a refused write', () => {
    const storage = memoryStorage();
    expect(writePracticeSets(stored, storage)).toBe(true);
    expect(readPracticeSets(storage)).toEqual(stored);
    expect(writePracticeSets(stored, memoryStorage({}, practiceSetsKey))).toBe(false);
  });
});

describe('progress export and import with sets', () => {
  const progressJson = (attempts: ProgressAttempt[]) => JSON.stringify({ version: 1, attempts });

  it('carries the sets in the export and restores them on import', () => {
    const source = memoryStorage({ [progressStorageKey]: progressJson([attempt]), [practiceSetsKey]: JSON.stringify(stored) });
    const exported = JSON.parse(createProgressStore(source).exportJson());
    expect(exported).toEqual({ version: 1, attempts: [attempt], review: {}, sets: stored });

    const target = memoryStorage({ [practiceSetsKey]: JSON.stringify({ version: 1, activeId: null, sets: [{ ...sql, id: 'other-1' }] }) });
    const result = createProgressStore(target).importJson(JSON.stringify(exported));
    expect(result).toEqual({ ok: true, snapshot: { version: 1, attempts: [attempt] }, sets: 2 });
    expect(JSON.parse(target.items.get(practiceSetsKey)!)).toEqual(stored);
    expect(JSON.parse(target.items.get(progressStorageKey)!)).toEqual({ version: 1, attempts: [attempt] });
  });

  it('leaves sets out of the export when none were ever saved or the stored value is damaged', () => {
    expect(JSON.parse(createProgressStore(memoryStorage()).exportJson())).not.toHaveProperty('sets');
    const damaged = memoryStorage({ [practiceSetsKey]: '{not json' });
    expect(JSON.parse(createProgressStore(damaged).exportJson())).not.toHaveProperty('sets');
  });

  it('keeps the current sets when an older export has no sets field', () => {
    const current = JSON.stringify(stored);
    const storage = memoryStorage({ [practiceSetsKey]: current });
    const result = createProgressStore(storage).importJson(progressJson([attempt]));
    expect(result).toEqual({ ok: true, snapshot: { version: 1, attempts: [attempt] } });
    expect(storage.items.get(practiceSetsKey)).toBe(current);
  });

  it('refuses invalid set data and writes nothing', () => {
    const before = { [progressStorageKey]: progressJson([]), [practiceSetsKey]: JSON.stringify(stored) };
    const storage = memoryStorage(before);
    const bad = { version: 1, activeId: null, sets: [playwright, { ...sql, name: playwright.name }] };
    const result = createProgressStore(storage).importJson(JSON.stringify({ version: 1, attempts: [attempt], sets: bad }));
    expect(result).toEqual({ ok: false, message: 'The practice set data is invalid. Choose a POM Proof export.' });
    expect(Object.fromEntries(storage.items)).toEqual(before);
  });

  it('removes sets again that were not stored before, when saving the attempts fails', () => {
    const storage = { ...memoryStorage({}, progressStorageKey), removeItem(key: string) { storage.items.delete(key); } };
    const imported = { version: 1, attempts: [attempt], sets: stored };
    const result = createProgressStore(storage).importJson(JSON.stringify(imported));
    expect(result).toMatchObject({ ok: false });
    expect(Object.fromEntries(storage.items)).toEqual({});
  });

  it('puts the sets and review cards back when saving the attempts fails', () => {
    const before = { [practiceSetsKey]: JSON.stringify(stored), [reviewKey]: JSON.stringify({}) };
    const storage = memoryStorage(before, progressStorageKey);
    const imported = { version: 1, attempts: [attempt], review: {}, sets: noPracticeSets() };
    const result = createProgressStore(storage).importJson(JSON.stringify(imported));
    expect(result).toEqual({ ok: false, message: expect.stringContaining('could not be saved') });
    expect(Object.fromEntries(storage.items)).toEqual(before);
  });
});
