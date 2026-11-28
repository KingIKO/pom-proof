/**
 * Practice sets: filters a learner saves under a name, such as `Playwright and API`. A set keeps
 * only the filter query, so the list works out its problems again on every visit and new problems
 * join on their own. One set is active at a time, and a visit to the bare Practice list applies it.
 * The sets live in localStorage and travel in progress exports as the optional `sets` field.
 */
export const practiceSetsKey = 'pom-proof:practice-sets';
export const setNameLimit = 40;

export interface PracticeSet {
  id: string;
  name: string;
  /** The list's filter query without the leading `?`, for example `topic=playwright%2Capi`. */
  query: string;
  createdAt: string;
}

export interface PracticeSets {
  version: 1;
  /** The set a bare visit to the list applies, or null for all problems. */
  activeId: string | null;
  sets: PracticeSet[];
}

type Store = Pick<Storage, 'getItem' | 'setItem'>;
export type NameCheck = { ok: true; name: string } | { ok: false; message: string };

const setId = /^[a-z0-9-]{1,64}$/;
const nameKey = (name: string) => name.trim().toLocaleLowerCase('en');

export const noPracticeSets = (): PracticeSets => ({ version: 1, activeId: null, sets: [] });

/** A trimmed name of 1 to 40 characters that no other set uses, ignoring case. */
export function checkSetName(input: string, sets: readonly PracticeSet[], exceptId?: string): NameCheck {
  const name = input.trim();
  const length = [...name].length;
  if (!length) return { ok: false, message: 'Enter a name for the set.' };
  if (length > setNameLimit) return { ok: false, message: `Use ${setNameLimit} characters or fewer. This name has ${length}.` };
  if (sets.some((set) => set.id !== exceptId && nameKey(set.name) === nameKey(name))) {
    return { ok: false, message: 'A set with this name exists. Choose another name.' };
  }
  return { ok: true, name };
}

/**
 * The sets in a stored value or an import, or undefined when the value is not in the expected
 * shape. An active id that names no set becomes null.
 */
export function decodePracticeSets(value: unknown): PracticeSets | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return;
  const { version, activeId, sets } = value as Record<string, unknown>;
  if (version !== 1 || !Array.isArray(sets)) return;
  if (activeId !== undefined && activeId !== null && typeof activeId !== 'string') return;
  const decoded: PracticeSet[] = [];
  for (const set of sets) {
    if (!set || typeof set !== 'object' || Array.isArray(set)) return;
    const { id, name, query, createdAt } = set as Record<string, unknown>;
    if (typeof id !== 'string' || !setId.test(id) || decoded.some((other) => other.id === id)) return;
    if (typeof name !== 'string' || typeof query !== 'string') return;
    if (typeof createdAt !== 'string' || !Number.isFinite(Date.parse(createdAt))) return;
    const named = checkSetName(name, decoded);
    if (!named.ok) return;
    // Re-encoding keeps the query a plain query string whatever was stored.
    decoded.push({ id, name: named.name, query: new URLSearchParams(query).toString(), createdAt });
  }
  const active = decoded.some(({ id }) => id === activeId) ? activeId as string : null;
  return { version: 1, activeId: active, sets: decoded };
}

function localStore(): Store | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** The stored sets: none when nothing or a damaged value is stored, null when storage is unavailable. */
export function readPracticeSets(store = localStore()): PracticeSets | null {
  let raw: string | null;
  try {
    if (!store) return null;
    raw = store.getItem(practiceSetsKey);
  } catch {
    return null;
  }
  if (raw === null) return noPracticeSets();
  try {
    return decodePracticeSets(JSON.parse(raw)) ?? noPracticeSets();
  } catch {
    return noPracticeSets();
  }
}

/** Stores the sets; false when storage refuses them. */
export function writePracticeSets(value: PracticeSets, store = localStore()) {
  try {
    if (!store) return false;
    store.setItem(practiceSetsKey, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/** Calls `update` when another tab changes the stored sets. */
export function onPracticeSetsChange(update: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === practiceSetsKey || event.key === null) update();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

export function newSetId(now = Date.now(), random = Math.random()) {
  return `${now.toString(36)}-${Math.floor(random * 36 ** 6).toString(36).padStart(6, '0')}`;
}

export function findPracticeSet(state: PracticeSets, id: string | null | undefined) {
  return id ? state.sets.find((set) => set.id === id) : undefined;
}

/** Adds a set with a name already checked by `checkSetName` and makes it the active one. */
export function addPracticeSet(state: PracticeSets, name: string, query: string, { id = newSetId(), now = new Date() } = {}): PracticeSets {
  return { version: 1, activeId: id, sets: [...state.sets, { id, name: name.trim(), query, createdAt: now.toISOString() }] };
}

export function changePracticeSet(state: PracticeSets, id: string, change: Partial<Pick<PracticeSet, 'name' | 'query'>>): PracticeSets {
  return {
    ...state,
    sets: state.sets.map((set) => set.id === id ? { ...set, ...change, ...(change.name === undefined ? {} : { name: change.name.trim() }) } : set),
  };
}

/** Removes a set; when it was the active one, a bare visit shows all problems again. */
export function deletePracticeSet(state: PracticeSets, id: string): PracticeSets {
  return { version: 1, activeId: state.activeId === id ? null : state.activeId, sets: state.sets.filter((set) => set.id !== id) };
}

export function choosePracticeSet(state: PracticeSets, id: string | null): PracticeSets {
  return { ...state, activeId: findPracticeSet(state, id) ? id : null };
}
