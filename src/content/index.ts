import type { PracticeItem, Question, Track, Kind } from './types';
import { KIND_ORDER } from './kinds';

/*
  Content registry. Each practice item lives in its own file under
  items/<kind>/<id>.ts with a default export, so authors never edit a shared
  list. Question banks live in questions/<topic>.ts as default-exported arrays.
*/

const itemModules = import.meta.glob<{ default: PracticeItem }>('./items/**/*.ts', { eager: true });
const questionModules = import.meta.glob<{ default: Question[] }>('./questions/*.ts', { eager: true });
const trackModules = import.meta.glob<{ default: Track }>('./tracks/*.ts', { eager: true });

const DIFF_RANK = { Easy: 0, Medium: 1, Hard: 2 } as const;

export const ITEMS: PracticeItem[] = Object.values(itemModules)
  .map((m) => m.default)
  .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty] || a.title.localeCompare(b.title));

export const ITEM_BY_ID: Record<string, PracticeItem> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));

export const QUESTIONS: Question[] = Object.values(questionModules).flatMap((m) => m.default);
export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
export const QUESTION_TOPICS: string[] = Array.from(new Set(QUESTIONS.map((q) => q.topic))).sort();

export const TRACKS: Track[] = Object.values(trackModules)
  .map((m) => m.default)
  .sort((a, b) => ['manual', 'automation', 'sdet', 'lead'].indexOf(a.role) - ['manual', 'automation', 'sdet', 'lead'].indexOf(b.role));

export const ALL_TOPICS: string[] = Array.from(new Set(ITEMS.flatMap((i) => i.topics))).sort();

export function itemsOfKind(kind: Kind) {
  return ITEMS.filter((i) => i.kind === kind);
}

/** Anything a track can point at: a practice item or a question id. */
export function lookup(id: string): { type: 'item'; item: PracticeItem } | { type: 'question'; question: Question } | null {
  if (ITEM_BY_ID[id]) return { type: 'item', item: ITEM_BY_ID[id] };
  if (QUESTION_BY_ID[id]) return { type: 'question', question: QUESTION_BY_ID[id] };
  return null;
}

/** Deterministic daily set from the UTC date: one item from three different kinds plus five review questions. */
export function dailySet(date = new Date()) {
  const key = date.toISOString().slice(0, 10);
  let h = 2166136261;
  for (const c of key) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
  const kinds = [...new Set(ITEMS.map((i) => i.kind))];
  const picked: PracticeItem[] = [];
  const pool = [...kinds];
  while (picked.length < 3 && pool.length) {
    const k = pool.splice(Math.floor(rand() * pool.length), 1)[0];
    const of = ITEMS.filter((i) => i.kind === k);
    picked.push(of[Math.floor(rand() * of.length)]);
  }
  const qs = [...QUESTIONS];
  const questions: Question[] = [];
  while (questions.length < 5 && qs.length) questions.push(qs.splice(Math.floor(rand() * qs.length), 1)[0]);
  return { key, items: picked, questions };
}
