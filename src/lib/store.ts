import { useSyncExternalStore } from 'react';

/** Local progress. Everything lives in localStorage; there is no account. */
export interface ItemProgress {
  status: 'attempted' | 'solved';
  updatedAt: number;
  /** Best score for graded items (0-100). */
  best?: number;
}

export interface CardState {
  /** Leitner box 0-4. Higher means seen correctly more times in a row. */
  box: number;
  due: number;
  seen: number;
  last: 'missed' | 'shaky' | 'solid';
}

export interface State {
  version: 1;
  items: Record<string, ItemProgress>;
  cards: Record<string, CardState>;
  drafts: Record<string, string>;
  prefs: { lang: 'javascript' | 'typescript' | 'python'; theme: 'system' | 'light' | 'dark' };
  activity: Record<string, number>;
}

const KEY = 'pomproof:v1';

const empty = (): State => ({
  version: 1,
  items: {},
  cards: {},
  drafts: {},
  prefs: { lang: 'javascript', theme: 'system' },
  activity: {},
});

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<State>;
    const base = empty();
    return { ...base, ...parsed, prefs: { ...base.prefs, ...(parsed.prefs ?? {}) } } as State;
  } catch {
    return empty();
  }
}

let state: State = typeof localStorage === 'undefined' ? empty() : load();
const listeners = new Set<() => void>();
let saveTimer: number | undefined;

function emit() {
  for (const l of listeners) l();
  if (typeof window === 'undefined') return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked: progress stays in memory for this tab */
    }
  }, 150);
}

export function getState() {
  return state;
}

export function update(fn: (s: State) => State) {
  state = fn(state);
  emit();
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}

const today = () => new Date().toISOString().slice(0, 10);

function bumpActivity(s: State): State {
  const d = today();
  return { ...s, activity: { ...s.activity, [d]: (s.activity[d] ?? 0) + 1 } };
}

export function markItem(id: string, solved: boolean, score?: number) {
  update((s) => {
    const prev = s.items[id];
    const status = prev?.status === 'solved' || solved ? 'solved' : 'attempted';
    const best = score === undefined ? prev?.best : Math.max(prev?.best ?? 0, score);
    return bumpActivity({ ...s, items: { ...s.items, [id]: { status, updatedAt: Date.now(), best } } });
  });
}

export function saveDraft(key: string, code: string) {
  update((s) => ({ ...s, drafts: { ...s.drafts, [key]: code } }));
}

export function clearDraft(key: string) {
  update((s) => {
    const drafts = { ...s.drafts };
    delete drafts[key];
    return { ...s, drafts };
  });
}

const DAY = 86_400_000;
/** Days until the next review per Leitner box. */
const INTERVALS = [0, 1, 3, 7, 16];

export function rateCard(id: string, rating: CardState['last']) {
  update((s) => {
    const prev = s.cards[id];
    const box = rating === 'missed' ? 0 : rating === 'shaky' ? Math.max(1, prev?.box ?? 1) : Math.min(4, (prev?.box ?? 0) + 1);
    const wait = rating === 'missed' ? 10 * 60_000 : INTERVALS[box] * DAY;
    const card: CardState = { box, due: Date.now() + wait, seen: (prev?.seen ?? 0) + 1, last: rating };
    return bumpActivity({ ...s, cards: { ...s.cards, [id]: card } });
  });
}

export function setPref<K extends keyof State['prefs']>(key: K, value: State['prefs'][K]) {
  update((s) => ({ ...s, prefs: { ...s.prefs, [key]: value } }));
}

export function resetProgress() {
  state = empty();
  emit();
}

export function exportProgress(): string {
  return JSON.stringify(state, null, 2);
}

export function importProgress(json: string) {
  const parsed = JSON.parse(json) as State;
  if (parsed.version !== 1 || typeof parsed.items !== 'object') throw new Error('This file is not a POM Proof progress export.');
  state = { ...empty(), ...parsed };
  emit();
}
