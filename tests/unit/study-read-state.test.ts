import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decodeStudy, encodeStudy, formatDay, isNewerStudy, localDate, setRead, studyKey, studyStorage,
} from '../../src/components/study/read-state';

/** A window with an in-memory localStorage; `blocked` makes every storage call throw. */
function fakeWindow(stored: Record<string, string> = {}, blocked = false) {
  const values = new Map(Object.entries(stored));
  const refuse = () => { throw new DOMException('Blocked', 'SecurityError'); };
  const localStorage = {
    getItem: (key: string) => (blocked ? refuse() : values.get(key) ?? null),
    setItem: (key: string, value: string) => (blocked ? refuse() : void values.set(key, value)),
    removeItem: (key: string) => (blocked ? refuse() : void values.delete(key)),
  };
  vi.stubGlobal('window', { localStorage, dispatchEvent: () => true });
  return values;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Study storage', () => {
  it('reports a stored value from a newer version, and only then', () => {
    expect(isNewerStudy(JSON.stringify({ version: 2, read: {} }))).toBe(true);
    expect(isNewerStudy(encodeStudy({}))).toBe(false);
    expect(isNewerStudy('not json')).toBe(false);
    expect(isNewerStudy(null)).toBe(false);
  });

  it('leaves a newer stored value alone and says why', () => {
    const newer = JSON.stringify({ version: 2, read: { 'framework-design/page-object-model': '2027-01-04' } });
    const values = fakeWindow({ [studyKey]: newer });
    expect(studyStorage()).toBe('newer');
    expect(() => setRead('framework-design/parameterised-tests', true, '2026-11-27')).toThrow('newer version');
    expect(values.get(studyKey)).toBe(newer);
  });

  it('reports blocked storage', () => {
    fakeWindow({}, true);
    expect(studyStorage()).toBe('blocked');
    expect(() => setRead('framework-design/parameterised-tests', true)).toThrow();
  });

  it('saves a mark and leaves no probe behind', () => {
    const values = fakeWindow();
    expect(studyStorage()).toBe('ready');
    setRead('framework-design/parameterised-tests', true, '2026-11-27');
    expect([...values.keys()]).toEqual([studyKey]);
    expect(decodeStudy(values.get(studyKey))).toEqual({ 'framework-design/parameterised-tests': '2026-11-27' });
  });
});

describe('Study read state', () => {
  it('round-trips the stored marks', () => {
    const read = { 'framework-design/page-object-model': '2026-11-27' };
    expect(JSON.parse(encodeStudy(read))).toEqual({ version: 1, read });
    expect(decodeStudy(encodeStudy(read))).toEqual(read);
  });

  it.each([
    ['nothing stored', null],
    ['text that is not JSON', 'not json'],
    ['another version', JSON.stringify({ version: 2, read: { 'a/b': '2026-11-27' } })],
    ['read as a list', JSON.stringify({ version: 1, read: ['a/b'] })],
    ['read missing', JSON.stringify({ version: 1 })],
    ['a bare value', '7'],
  ])('reads %s as nothing read', (_name, raw) => {
    expect(decodeStudy(raw)).toEqual({});
  });

  it('drops malformed ids and dates and keeps the rest', () => {
    const raw = JSON.stringify({
      version: 1,
      read: {
        'framework-design/page-object-model': '2026-11-27',
        'no-slash': '2026-11-27',
        'Upper/Case': '2026-11-27',
        'framework-design/bad-date': '2026-02-30',
        'framework-design/not-text': 20261127,
      },
    });
    expect(decodeStudy(raw)).toEqual({ 'framework-design/page-object-model': '2026-11-27' });
  });

  it('formats a read day, adding the year when it is not this year', () => {
    expect(formatDay('2026-11-27', 2026)).toBe('27 Nov');
    expect(formatDay('2025-09-03', 2026)).toBe('3 Sep 2025');
    expect(formatDay('2026-11-27')).toBe('27 Nov 2026');
  });

  it('uses the local calendar day', () => {
    expect(localDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05');
  });
});
