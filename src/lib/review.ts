export type Rating = 'missed' | 'shaky' | 'solid';

export interface CardState {
  box: 0 | 1 | 2 | 3 | 4;
  due: string;
  seen: number;
  last: Rating;
}

const key = 'pom-proof:review';
const intervals = [0, 1, 3, 7, 16] as const;
const nextBox = [1, 2, 3, 4, 4] as const;
const minute = 60_000;
const day = 24 * 60 * minute;

function isCard(value: unknown): value is CardState {
  if (typeof value !== 'object' || value === null) return false;
  const { box, due, seen, last } = value as Partial<CardState>;
  return typeof box === 'number' && Number.isInteger(box) && box >= 0 && box <= 4 &&
    typeof due === 'string' && Number.isFinite(Date.parse(due)) &&
    typeof seen === 'number' && Number.isSafeInteger(seen) && seen > 0 &&
    (last === 'missed' || last === 'shaky' || last === 'solid');
}

export function reviewSnapshot(): Record<string, CardState> {
  try {
    const stored: unknown = JSON.parse(window.localStorage.getItem(key) ?? '{}');
    if (typeof stored === 'object' && stored !== null && !Array.isArray(stored)) {
      return Object.fromEntries(Object.entries(stored).filter((entry): entry is [string, CardState] =>
        isCard(entry[1])));
    }
  } catch {
    return {};
  }
  return {};
}

export function cardState(questionId: string): CardState | undefined {
  const cards = reviewSnapshot();
  return Object.hasOwn(cards, questionId) ? cards[questionId] : undefined;
}

export function rate(questionId: string, rating: Rating, now = new Date()): CardState {
  const cards = reviewSnapshot();
  const previous = Object.hasOwn(cards, questionId) ? cards[questionId] : undefined;
  const from = previous?.box ?? 0;
  const box = rating === 'missed' ? 0 : rating === 'solid' ? nextBox[from] : from;
  const delay = rating === 'missed' ? 10 * minute : intervals[box] * day;
  const card: CardState = {
    box,
    due: new Date(now.getTime() + delay).toISOString(),
    seen: (previous?.seen ?? 0) + 1,
    last: rating,
  };
  window.localStorage.setItem(key, JSON.stringify({ ...cards, [questionId]: card }));
  return card;
}

export function dueIds(allIds: string[], now = new Date()): string[] {
  const cards = reviewSnapshot();
  const unseen: string[] = [];
  const due: { id: string; time: number }[] = [];
  for (const id of new Set(allIds)) {
    if (!Object.hasOwn(cards, id)) {
      unseen.push(id);
    } else {
      const time = Date.parse(cards[id].due);
      if (time <= now.getTime()) due.push({ id, time });
    }
  }
  return [...due.sort((a, b) => a.time - b.time).map(({ id }) => id), ...unseen];
}
