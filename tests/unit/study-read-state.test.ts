import { describe, expect, it } from 'vitest';
import { decodeStudy, encodeStudy, formatDay, localDate } from '../../src/components/study/read-state';

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
