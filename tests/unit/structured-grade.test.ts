import { describe, expect, it } from 'vitest';
import type { GradeResult, Problem } from '../../src/lib/contracts';
import { budgetSpent, grade } from '../../src/engines/structured/grade';

type Value = Problem<'scenario'>['reference'];

const problem: Problem<'scenario'> = {
  id: 'scenario/unit-sample',
  kind: 'scenario',
  title: 'Unit sample',
  topic: 'release-risk',
  difficulty: 'easy',
  minutes: 1,
  roles: ['manual-qa'],
  items: [
    {
      id: 'stop',
      type: 'single-choice',
      prompt: 'Which result stops rollout?',
      choices: [{ id: 'yes', text: 'Double booking' }, { id: 'no', text: 'Slow render' }],
    },
    {
      id: 'evidence',
      type: 'multi-select',
      prompt: 'Pick the evidence.',
      choices: [
        { id: 'a', text: 'Receipt IDs' },
        { id: 'b', text: 'Ledger entry' },
        { id: 'c', text: 'Customer screenshot' },
        { id: 'd', text: 'Storefront screenshot' },
      ],
    },
    {
      id: 'steps',
      type: 'ordering',
      prompt: 'Order the steps.',
      choices: [{ id: 'first', text: 'Stub' }, { id: 'second', text: 'Trigger' }, { id: 'third', text: 'Assert' }],
    },
    {
      id: 'smoke',
      type: 'budgeted-pick',
      prompt: 'Spend six minutes.',
      budget: 6,
      choices: [
        { id: 'concurrent', text: 'Concurrent booking', cost: 4 },
        { id: 'cancel', text: 'Cancel and rebook', cost: 2 },
        { id: 'browse', text: 'Browse hours', cost: 2 },
      ],
    },
    {
      id: 'claims',
      type: 'line-marking',
      prompt: 'Mark the overclaims.',
      lines: [{ id: 'l1', text: 'Build 421' }, { id: 'l2', text: 'Two refunds issued' }, { id: 'l3', text: 'All customers' }],
    },
  ],
  reference: { stop: 'yes', evidence: ['a', 'b'], steps: ['first', 'second', 'third'], smoke: ['concurrent', 'cancel'], claims: ['l2', 'l3'] },
  decoy: { stop: 'no', evidence: ['a'], steps: ['second', 'first', 'third'], smoke: ['concurrent', 'browse'], claims: ['l1'] },
};

const reference = problem.reference;
const run = (overrides: Value) => grade(problem, { kind: 'scenario', value: { ...reference, ...overrides } });

function itemOf(result: GradeResult<'scenario'>, id: string) {
  expect(result.status).toBe('graded');
  const details = (result as Extract<GradeResult<'scenario'>, { status: 'graded' }>).details;
  const item = details.items.find((entry) => entry.id === id);
  expect(item, `item ${id} is reported`).toBeDefined();
  return item!;
}
const scoreOf = (result: GradeResult<'scenario'>) => (result as { score?: number }).score;

describe('structured grader', () => {
  it('gives full marks to the reference and passes every item', () => {
    const result = run({});
    expect(result).toMatchObject({ kind: 'scenario', status: 'graded', score: 1 });
    expect(itemOf(result, 'stop').passed).toBe(true);
    expect((result as { details: { items: unknown[] } }).details.items).toHaveLength(problem.items.length);
  });

  it('averages item scores into the total', () => {
    // stop wrong (0) and evidence half right (0.5); three items right.
    const result = run({ stop: 'no', evidence: ['a'] });
    expect(scoreOf(result)).toBeCloseTo((0 + 0.5 + 1 + 1 + 1) / 5);
    expect(itemOf(result, 'stop').passed).toBe(false);
  });

  it('names the selected and correct options for a wrong single choice', () => {
    expect(itemOf(run({ stop: 'no' }), 'stop').note).toBe('Your answer: Slow render. Correct answer: Double booking.');
    expect(itemOf(run({}), 'stop').note).toBeUndefined();
  });

  it('keeps existing punctuation on single-choice labels', () => {
    const punctuated: Problem<'scenario'> = {
      ...problem,
      items: [{
        id: 'stop', type: 'single-choice', prompt: 'Which result stops rollout?',
        choices: [{ id: 'yes', text: 'Double booking.' }, { id: 'no', text: 'Slow render.' }],
      }],
      reference: { stop: 'yes' },
    };
    const result = grade(punctuated, { kind: 'scenario', value: { stop: 'no' } });
    expect(itemOf(result, 'stop').note).toBe('Your answer: Slow render. Correct answer: Double booking.');
  });

  describe('multi-select penalties', () => {
    it.each([
      { picks: ['a', 'b'], score: 1 },
      { picks: ['a'], score: 0.5 },
      { picks: ['a', 'b', 'c'], score: 0.5 },
      { picks: ['a', 'c', 'd'], score: 0 },
      { picks: ['c', 'd'], score: 0 },
      { picks: [], score: 0 },
    ])('scores $picks as $score of the item', ({ picks, score }) => {
      const result = run({ evidence: picks });
      expect(scoreOf(result)).toBeCloseTo((4 + score) / 5);
      expect(itemOf(result, 'evidence').passed).toBe(score === 1);
    });

    it('separates unselected correct options from incorrect picks', () => {
      const note = itemOf(run({ evidence: ['a', 'c'] }), 'evidence').note;
      expect(note).toBe('Also correct: Ledger entry. Not correct: Customer screenshot.');
    });

    it('never goes below zero for one item', () => {
      expect(scoreOf(run({ evidence: ['c', 'd'] }))).toBeCloseTo(4 / 5);
    });
  });

  describe('ordering partial credit', () => {
    it.each([
      { order: ['first', 'second', 'third'], score: 1 },
      { order: ['second', 'first', 'third'], score: 2 / 3 },
      { order: ['first', 'third', 'second'], score: 2 / 3 },
      { order: ['third', 'first', 'second'], score: 1 / 3 },
      { order: ['third', 'second', 'first'], score: 0 },
    ])('scores $order as $score by pairs in order', ({ order, score }) => {
      const result = run({ steps: order });
      expect(scoreOf(result)).toBeCloseTo((4 + score) / 5);
      expect(itemOf(result, 'steps').passed).toBe(score === 1);
    });

    it('names the first pair out of order', () => {
      expect(itemOf(run({ steps: ['second', 'first', 'third'] }), 'steps').note).toBe('Put “Stub” before “Trigger”.');
    });

    it('rejects an order that leaves an option out', () => {
      expect(run({ steps: ['first', 'second'] })).toMatchObject({ status: 'invalid-answer', message: expect.stringContaining('Order every option') });
    });
  });

  describe('budgeted picks', () => {
    it('reports what the picks cost', () => {
      const item = problem.items[3];
      expect(item.type === 'budgeted-pick' && budgetSpent(item, ['concurrent', 'browse'])).toBe(6);
    });

    it('accepts picks that spend the whole budget', () => {
      const result = run({ smoke: ['concurrent', 'browse'] });
      expect(itemOf(result, 'smoke')).toMatchObject({
        passed: false,
        note: 'Also correct: Cancel and rebook. Not correct: Browse hours.',
      });
      expect(scoreOf(result)).toBeCloseTo(4 / 5);
    });

    it('treats an over-budget answer as invalid instead of scoring it', () => {
      const result = run({ smoke: ['concurrent', 'cancel', 'browse'] });
      expect(result).toMatchObject({ kind: 'scenario', status: 'invalid-answer' });
      expect((result as { message: string }).message).toContain('Spent 8 of 6');
    });
  });

  it('grades line marking against the line ids', () => {
    const result = run({ claims: ['l1', 'l2'] });
    expect(itemOf(result, 'claims')).toMatchObject({
      passed: false,
      note: 'Also correct: All customers. Not correct: Build 421.',
    });
  });

  describe('invalid answers', () => {
    it.each([
      { name: 'an answer for another kind', answer: { kind: 'diagnosis', value: reference }, message: 'Answer kind does not match' },
      { name: 'a missing item', answer: { kind: 'scenario', value: { ...reference, stop: undefined } }, message: 'Answer this item' },
      { name: 'an unknown item', answer: { kind: 'scenario', value: { ...reference, extra: 'yes' } }, message: 'Unknown item' },
      { name: 'an unknown option', answer: { kind: 'scenario', value: { ...reference, evidence: ['z'] } }, message: 'Unknown option' },
      { name: 'a repeated option', answer: { kind: 'scenario', value: { ...reference, evidence: ['a', 'a'] } }, message: 'List each option once' },
      { name: 'a list for a single choice', answer: { kind: 'scenario', value: { ...reference, stop: ['yes'] } }, message: 'Choose one option' },
      { name: 'a string for a list', answer: { kind: 'scenario', value: { ...reference, evidence: 'a' } }, message: 'Provide a list' },
      { name: 'no answer object', answer: { kind: 'scenario', value: null }, message: 'Answers must be supplied' },
    ])('rejects $name', ({ answer, message }) => {
      const value = answer.value === null ? null : JSON.parse(JSON.stringify(answer.value));
      const result = grade(problem, { kind: answer.kind, value } as never);
      expect(result).toMatchObject({ status: 'invalid-answer', message: expect.stringContaining(message) });
    });
  });

  it('gives an empty multi-select reference full marks only for no picks', () => {
    const empty: Problem<'scenario'> = { ...problem, reference: { ...reference, evidence: [] } };
    expect(scoreOf(grade(empty, { kind: 'scenario', value: { ...reference, evidence: [] } }))).toBe(1);
    expect(scoreOf(grade(empty, { kind: 'scenario', value: { ...reference, evidence: ['a'] } }))).toBeCloseTo(4 / 5);
  });
});
