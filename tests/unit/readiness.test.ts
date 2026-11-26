import { describe, expect, it } from 'vitest';
import type { ProgressAttempt } from '../../src/lib/contracts';
import { kindLabel } from '../../src/lib/labels';
import { calculateReadiness, type ReadinessCatalog } from '../../src/lib/readiness';
import type { CardState } from '../../src/lib/review';

// 2G's definition: per kind, the mean best score over all problems of that kind (unattempted
// count as 0) and the solved count; for questions, the share of cards at box 2 or higher; weak
// topics are attempted topics below full marks, lowest average first, plus never-attempted topics.
const catalog: ReadinessCatalog = {
  problems: [
    { id: 'sql/a', kind: 'sql', topic: 'joins' },
    { id: 'sql/b', kind: 'sql', topic: 'joins' },
    { id: 'sql/c', kind: 'sql', topic: 'aggregates' },
    { id: 'sql/d', kind: 'sql', topic: 'windows' },
    { id: 'code/a', kind: 'code', topic: 'reporting' },
    { id: 'locator/a', kind: 'locator', topic: 'tables' },
  ],
  questionIds: ['api/one', 'api/two', 'api/three', 'agile/four'],
};

let clock = Date.parse('2026-11-26T09:00:00.000Z');
const attempt = (problemId: string, score: number): ProgressAttempt =>
  ({ problemId, score, completedAt: new Date((clock += 60_000)).toISOString() });
const card = (box: CardState['box']): CardState => ({ box, due: '2026-11-27T09:00:00.000Z', seen: 1, last: 'solid' });
const round = (result: ReturnType<typeof calculateReadiness>, kind: string) => result.rounds.find((row) => row.kind === kind)!;

describe('calculateReadiness', () => {
  it('has a row for every round kind, in label order, even with no progress', () => {
    const result = calculateReadiness([], {}, catalog);
    expect(result.rounds.map(({ kind }) => kind)).toEqual(Object.keys(kindLabel));
    expect(round(result, 'sql')).toEqual({ kind: 'sql', total: 4, solved: 0, averageBest: 0 });
    expect(round(result, 'scenario')).toEqual({ kind: 'scenario', total: 0, solved: 0, averageBest: null });
    expect(result.questions).toEqual({ total: 4, atBoxTwo: 0, share: 0 });
  });

  it('counts unattempted problems as zero in the round average', () => {
    const result = calculateReadiness([attempt('sql/a', 1), attempt('sql/b', 0.5)], {}, catalog);
    expect(round(result, 'sql')).toEqual({ kind: 'sql', total: 4, solved: 1, averageBest: 1.5 / 4 });
  });

  it('keeps the best score when a later retake scores lower', () => {
    const result = calculateReadiness([attempt('code/a', 1), attempt('code/a', 0.25)], {}, catalog);
    expect(round(result, 'code')).toEqual({ kind: 'code', total: 1, solved: 1, averageBest: 1 });
    expect(result.needsPractice.map(({ topic }) => topic)).not.toContain('reporting');
  });

  it('treats a zero-score attempt as attempted, not as untouched', () => {
    const result = calculateReadiness([attempt('locator/a', 0)], {}, catalog);
    expect(round(result, 'locator')).toEqual({ kind: 'locator', total: 1, solved: 0, averageBest: 0 });
    expect(result.needsPractice).toContainEqual({ topic: 'tables', attempted: 1, total: 1, averageBest: 0 });
    expect(result.unattempted.map(({ topic }) => topic)).not.toContain('tables');
  });

  it('ignores attempts and cards for ids no longer in the catalog', () => {
    const result = calculateReadiness(
      [attempt('sql/removed', 1), attempt('scenario/gone', 1)],
      { 'api/removed': card(4), 'playwright/gone': card(2) },
      catalog,
    );
    expect(result.rounds.reduce((total, row) => total + row.solved, 0)).toBe(0);
    expect(round(result, 'scenario')).toMatchObject({ total: 0, solved: 0 });
    expect(result.questions).toEqual({ total: 4, atBoxTwo: 0, share: 0 });
    expect(result.needsPractice).toEqual([]);
  });

  it('counts question cards at box 2 or higher, and not box 0 or 1', () => {
    const result = calculateReadiness([], { 'api/one': card(1), 'api/two': card(2), 'api/three': card(4), 'agile/four': card(0) }, catalog);
    expect(result.questions).toEqual({ total: 4, atBoxTwo: 2, share: 0.5 });
    for (const [box, counted] of [[0, 0], [1, 0], [2, 1], [3, 1], [4, 1]] as const) {
      expect(calculateReadiness([], { 'api/one': card(box) }, catalog).questions.atBoxTwo, `box ${box}`).toBe(counted);
    }
  });

  it('reports no question share when there are no questions', () => {
    expect(calculateReadiness([], {}, { ...catalog, questionIds: [] }).questions).toEqual({ total: 0, atBoxTwo: 0, share: null });
  });

  it('lists weak topics lowest average first, using attempted problems only, then never-attempted topics by name', () => {
    const result = calculateReadiness([
      attempt('sql/a', 1), attempt('sql/b', 0.2),  // joins: both tried, average 0.6
      attempt('sql/c', 0.4),                         // aggregates: average 0.4
      attempt('code/a', 1),                          // reporting: full marks, not weak
    ], {}, catalog);
    expect(result.needsPractice).toEqual([
      { topic: 'aggregates', attempted: 1, total: 1, averageBest: 0.4 },
      { topic: 'joins', attempted: 2, total: 2, averageBest: 0.6 },
    ]);
    expect(result.unattempted.map(({ topic }) => topic)).toEqual(['tables', 'windows']);
  });

  it('averages a topic over attempted problems only, so an untried problem does not drag it down', () => {
    const result = calculateReadiness([attempt('sql/a', 0.5)], {}, catalog);
    expect(result.needsPractice).toContainEqual({ topic: 'joins', attempted: 1, total: 2, averageBest: 0.5 });
  });
});
