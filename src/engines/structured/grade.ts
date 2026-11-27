import type { Answer, GradeResult, Problem, StructuredKind } from '../../lib/contracts';

type StructuredItem = Problem<StructuredKind>['items'][number];

export function budgetSpent(item: Extract<StructuredItem, { type: 'budgeted-pick' }>, picks: readonly string[]) {
  return item.choices.reduce((spent, { id, cost }) => spent + (picks.includes(id) ? cost : 0), 0);
}

function scoreOrdering(picks: string[], reference: string[], labels: Map<string, string>) {
  const positions = reference.map((id) => picks.indexOf(id));
  const step = (index: number) => labels.get(reference[index])?.replace(/\.$/, '');
  const pairs = reference.length * (reference.length - 1) / 2;
  let inversions = 0;
  let note: string | undefined;
  for (let left = 0; left < positions.length; left++) {
    for (let right = left + 1; right < positions.length; right++) {
      if (positions[left] > positions[right]) {
        inversions++;
        note ??= `Put “${step(left)}” before “${step(right)}”.`;
      }
    }
  }
  return { score: (pairs - inversions) / pairs, note };
}

function sentence(text: string) {
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

function scorePicks(type: StructuredItem['type'], picks: string[], reference: string[], labels: Map<string, string>) {
  const missed = reference.filter((id) => !picks.includes(id));
  const extra = picks.filter((id) => !reference.includes(id));
  const correct = reference.length - missed.length;
  const score = reference.length === 0
    ? Number(extra.length === 0)
    : Math.max(0, (correct - extra.length) / reference.length);
  if (type === 'single-choice') {
    const note = score === 1 ? undefined
      : `${sentence(`Your answer: ${labels.get(picks[0])}`)} ${sentence(`Correct answer: ${labels.get(reference[0])}`)}`;
    return { score, note };
  }
  const notes: string[] = [];
  if (missed.length) notes.push(sentence(`Also correct: ${missed.map((id) => labels.get(id)).join(' / ')}`));
  if (extra.length) notes.push(sentence(`Not correct: ${extra.map((id) => labels.get(id)).join(' / ')}`));
  return { score, note: notes.join(' ') };
}

export function grade<K extends StructuredKind>(
  problem: Problem<StructuredKind> & { kind: K }, answer: Answer<StructuredKind>,
): GradeResult<K>;
export function grade(problem: Problem<StructuredKind>, answer: Answer<StructuredKind>): GradeResult<StructuredKind> {
  const invalid = (message: string): GradeResult<StructuredKind> =>
    ({ kind: problem.kind, status: 'invalid-answer', message });
  if (answer?.kind !== problem.kind) return invalid('Answer kind does not match the problem');
  const { value } = answer;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return invalid('Answers must be supplied for each item');
  }
  const unknownItem = Object.keys(value).find((id) => !problem.items.some((item) => item.id === id));
  if (unknownItem !== undefined) return invalid(`Unknown item “${unknownItem}”; use the items on this page`);

  const items: { id: string; passed: boolean; note?: string }[] = [];
  let total = 0;
  for (const item of problem.items) {
    const selection = Object.hasOwn(value, item.id) ? value[item.id] : undefined;
    if (selection === undefined) return invalid(`Answer this item: ${item.prompt}`);
    const choices = item.type === 'line-marking' ? item.lines : item.choices;
    const labels = new Map(choices.map(({ id, text }) => [id, text]));
    const expected = problem.reference[item.id];
    const reference = Array.isArray(expected) ? expected : [expected];

    let picks: string[];
    if (item.type === 'single-choice') {
      if (typeof selection !== 'string') return invalid(`Choose one option: ${item.prompt}`);
      picks = [selection];
    } else {
      if (!Array.isArray(selection)) return invalid(`Provide a list of options: ${item.prompt}`);
      picks = Array.from(selection);
    }
    const unknown = picks.findIndex((id) => !labels.has(id));
    if (unknown !== -1) return invalid(`Unknown option “${picks[unknown]}” for “${item.prompt}”; choose a listed option`);
    if (new Set(picks).size !== picks.length) return invalid(`List each option once: ${item.prompt}`);
    if (item.type === 'ordering' && picks.length !== choices.length) {
      return invalid(`Order every option: ${item.prompt}`);
    }
    if (item.type === 'budgeted-pick') {
      const spent = budgetSpent(item, picks);
      if (spent > item.budget) {
        return invalid(`Spent ${spent} of ${item.budget} for “${item.prompt}”; remove a pick and submit again`);
      }
    }

    const { score, note } = item.type === 'ordering'
      ? scoreOrdering(picks, reference, labels)
      : scorePicks(item.type, picks, reference, labels);
    total += score;
    items.push({ id: item.id, passed: score === 1, ...(note ? { note } : {}) });
  }

  return { kind: problem.kind, status: 'graded', score: total / items.length, details: { items } };
}
