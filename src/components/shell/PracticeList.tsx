import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { CatalogProblem } from '../../lib/catalog';
import type { ProgressAttempt } from '../../lib/contracts';
import { difficultyLabel, kindLabel, problemStatus, statusLabel, topicLabel } from '../../lib/labels';
import {
  latestPracticeContext, nearestShown, practiceContextEvent, practiceLabel, practiceRowId, readPracticeContext,
  writePracticeContext, type PracticeContext,
} from '../../lib/practice-context';
import {
  addPracticeSet, announceShownSet, changePracticeSet, checkSetName, choosePracticeSet, deletePracticeSet, findPracticeSet,
  latestShownSet, onPracticeSetsChange, readPracticeSets, shownSetEvent, writePracticeSets, type PracticeSet, type PracticeSets,
} from '../../lib/practice-sets';
import { bestScores, onProgressChange, readProgress } from '../../lib/progress';
import { problemUrl } from '../../lib/url';

const groups = {
  status: { label: 'Status', options: statusLabel },
  difficulty: { label: 'Difficulty', options: difficultyLabel },
  kind: { label: 'Kind', options: kindLabel },
  role: {
    label: 'Role',
    options: {
      'manual-qa': 'Manual QA',
      automation: 'Automation',
      sdet: 'SDET',
      senior: 'Senior',
    } satisfies Record<CatalogProblem['roles'][number], string>,
  },
  topic: { label: 'Topic', options: {} },
};
type Facet = keyof typeof groups;
type Filters = { q: string } & Record<Facet, string[]>;
type Option = { value: string; label: string; count: number };
type Row = CatalogProblem & { status: ReturnType<typeof problemStatus> };
type PracticeTarget = Pick<CatalogProblem, 'id' | 'title'>;

const facets = Object.keys(groups) as Facet[];
const emptyFilters: Filters = { q: '', status: [], difficulty: [], kind: [], role: [], topic: [] };
const topicLimit = 8;
const topicLabels = new Map([
  ['api', 'API'],
  ['api-testing', 'API testing'],
  ['ci', 'CI'],
  ['date-time', 'Date and time'],
]);
const displayTopic = (topic: string) => topicLabels.get(topic) ?? topicLabel(topic);

/** The filters in a list query, by default the page's own. Values the list does not offer are dropped. */
function readFilters(topics: readonly Option[], search = window.location.search): Filters {
  const params = new URLSearchParams(search);
  const filters = { ...emptyFilters, q: params.get('q') ?? '' };
  for (const key of facets) {
    const values = new Set(params.get(key)?.split(',') ?? []);
    filters[key] = [...values].filter((value) => key === 'topic'
      ? topics.some((topic) => topic.value === value)
      : Object.hasOwn(groups[key].options, value));
  }
  return filters;
}

/** Writes the filters into `params` the way the list URL holds them: one key per group, values comma-joined, empty keys removed. */
function setFilterParams(params: URLSearchParams, filters: Filters) {
  for (const key of ['q', ...facets] as const) {
    const value = key === 'q' ? filters.q : filters[key].join(',');
    if (value) params.set(key, value);
    else params.delete(key);
  }
  return params;
}

/** The filters as the list URL writes them, without the leading `?`. */
function filterQuery(filters: Filters) {
  return setFilterParams(new URLSearchParams(), filters).toString();
}

/** Whether a query names any filter, even one whose values the list drops. */
function hasFilterParams(search: string) {
  const params = new URLSearchParams(search);
  return ['q', ...facets].some((key) => params.has(key));
}

const filtersOff = (filters: Filters) => !filters.q.trim() && facets.every((key) => !filters[key].length);

/** The filters with the search trimmed, as a set stores them. */
const savedFilters = (filters: Filters): Filters => ({ ...filters, q: filters.q.trim() });

/** Equal for filters that list the same problems, whatever order the values were chosen in. */
function filterKey(filters: Filters) {
  const sorted = savedFilters(filters);
  for (const key of facets) sorted[key] = [...filters[key]].sort();
  return filterQuery(sorted);
}

function filterLabel(filters: Filters) {
  const names = (key: Exclude<Facet, 'topic'>) =>
    filters[key].map((value) => (groups[key].options as Record<string, string>)[value] ?? value);
  return practiceLabel({
    q: filters.q,
    topic: filters.topic.map(displayTopic),
    kind: names('kind'),
    difficulty: names('difficulty'),
    role: names('role'),
    status: names('status'),
  });
}

function facetValues(problem: Row, key: Facet): readonly string[] {
  return key === 'role' ? problem.roles : [problem[key]];
}

function countValues<T>(rows: readonly T[], values: (row: T) => readonly string[]) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    for (const value of values(row)) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return counts;
}

function filterOptions(rows: readonly Row[], key: Exclude<Facet, 'topic'>): Option[] {
  const counts = countValues(rows, (row) => facetValues(row, key));
  return Object.entries(groups[key].options)
    .map(([value, label]) => ({ value, label, count: counts.get(value) ?? 0 }));
}

function topicOptions(problems: readonly CatalogProblem[]): Option[] {
  return [...countValues(problems, ({ topic }) => [topic])]
    .sort(([a, countA], [b, countB]) => countB - countA || a.localeCompare(b, 'en'))
    .map(([value, count]) => ({ value, label: displayTopic(value), count }));
}

function useAttempts() {
  const [attempts, setAttempts] = useState<ProgressAttempt[]>([]);
  useEffect(() => {
    const update = () => setAttempts(readProgress().attempts);
    update();
    const unsubscribe = onProgressChange(update);
    window.addEventListener('pageshow', update);
    return () => {
      unsubscribe();
      window.removeEventListener('pageshow', update);
    };
  }, []);
  return attempts;
}

function nextProblem(problems: readonly PracticeTarget[], attempts: readonly ProgressAttempt[], scores: ReturnType<typeof bestScores>) {
  const catalog = new Map(problems.map((problem) => [problem.id, problem]));
  let recent: { problem: PracticeTarget; date: number } | undefined;
  for (const { problemId, completedAt } of attempts) {
    const problem = catalog.get(problemId);
    if (!problem || scores.get(problemId) === 1) continue;
    const date = Date.parse(completedAt);
    if (!recent || date >= recent.date) recent = { problem, date };
  }
  return recent?.problem ?? problems.find(({ id }) => scores.get(id) !== 1);
}

/** The list as this page shows it right now; null until the list reports its rows. */
function useShownList() {
  const [context, setContext] = useState<PracticeContext | null>(null);
  useEffect(() => {
    setContext(latestPracticeContext());
    const update = (event: Event) => setContext((event as CustomEvent<PracticeContext>).detail);
    window.addEventListener(practiceContextEvent, update);
    return () => window.removeEventListener(practiceContextEvent, update);
  }, []);
  return context;
}

/** The problems the list shows right now, in its order; the whole catalog until the list reports its rows. */
function useShownProblems(problems: PracticeTarget[]) {
  const context = useShownList();
  return useMemo(() => context?.items.map(([id, title]) => ({ id, title })) ?? problems, [context, problems]);
}

/** The title band count: every problem, or how many of them the filters leave. */
export function PracticeCount({ total }: { total: number }) {
  const context = useShownList();
  return <span class="num">{context?.query ? `${context.items.length} of ${total} problems` : `${total} problems`}</span>;
}

/** The name of the saved set the list shows unchanged, or null. */
function useShownSet() {
  const [name, setName] = useState<string | null>(null);
  useEffect(() => {
    setName(latestShownSet());
    const update = (event: Event) => setName((event as CustomEvent<string | null>).detail);
    window.addEventListener(shownSetEvent, update);
    return () => window.removeEventListener(shownSetEvent, update);
  }, []);
  return name;
}

export function PracticeProgress({ problems }: { problems: PracticeTarget[] }) {
  const attempts = useAttempts();
  const shown = useShownProblems(problems);
  const shownSet = useShownSet();
  const scores = bestScores(attempts);
  const solved = problems.filter(({ id }) => scores.get(id) === 1).length;
  const next = nextProblem(shown, attempts, scores);
  const setComplete = shownSet !== null && shown.length > 0 && shown.every(({ id }) => scores.get(id) === 1);

  return (
    <div class="practice-actions">
      <div class="progress-meter practice-progress">
        <span id="practice-solved"><strong>{solved}</strong> of {problems.length} solved</span>
        <progress class="progress-bar" aria-labelledby="practice-solved" value={solved} max={problems.length} />
      </div>
      {setComplete ? <p class="practice-complete">Set complete.</p> : next && (
        <a class="button primary practice-continue" href={problemUrl(next.id)} aria-label={`Continue: ${next.title}`}>
          Continue <span class="chevron right" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

type SetResult = { ok: true; message: string } | { ok: false; message: string; field?: true };
type SetMode = 'save' | 'rename' | 'delete' | null;

interface SetRowProps {
  sets: PracticeSets;
  selected: PracticeSet | undefined;
  /** Filters are on and differ from the selected set's. */
  changed: boolean;
  filtersOn: boolean;
  /** The name a new set starts with: the filters' own label. */
  suggestedName: string;
  choose(id: string | null): void;
  save(name: string): SetResult;
  update(): SetResult;
  rename(name: string): SetResult;
  remove(): SetResult;
}

/**
 * The practice set row above the filters: the picker, then the actions that fit the current state.
 * Every control is outline or text, so Continue stays the page's one filled button.
 */
function PracticeSetRow({ sets, selected, changed, filtersOn, suggestedName, choose, save, update, rename, remove }: SetRowProps) {
  const [mode, setMode] = useState<SetMode>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [focus, setFocus] = useState<string | null>(null);
  const row = useRef<HTMLDivElement>(null);

  // Focus moves in the render that shows its target, before paint, so it never rests on the page
  // body when a form closes. It falls back to the picker or the first action.
  useLayoutEffect(() => {
    if (!focus || !row.current) return;
    // `name-error` focuses the name field and keeps the cursor where the learner left it.
    const key = focus === 'name-error' ? 'name' : focus;
    const target = [key, 'picker', 'save']
      .map((name) => row.current!.querySelector<HTMLElement>(`[data-set-focus="${name}"]`))
      .find(Boolean);
    target?.focus();
    if (focus === 'name' && target instanceof HTMLInputElement) target.select();
    setFocus(null);
  }, [focus]);

  // A form for a set that another tab deleted, or a save form whose filters were cleared, closes.
  useEffect(() => {
    if ((mode === 'rename' || mode === 'delete') && !selected) setMode(null);
    if (mode === 'save' && !filtersOn) setMode(null);
  }, [mode, selected, filtersOn]);

  function open(next: Exclude<SetMode, null>) {
    setMode(next);
    setError('');
    setMessage('');
    setName(next === 'rename' ? selected?.name ?? '' : suggestedName);
    setFocus(next === 'delete' ? 'keep' : 'name');
  }

  function close(focusOn: string) {
    setMode(null);
    setError('');
    setFocus(focusOn);
  }

  function finish(result: SetResult, focusOn: string) {
    if (!result.ok && result.field) {
      setError(result.message);
      setFocus('name-error');
      return;
    }
    setMessage(result.message);
    if (result.ok) close(focusOn);
  }

  function submit(event: Event) {
    event.preventDefault();
    finish(mode === 'rename' ? rename(name) : save(name), mode === 'rename' ? 'rename' : 'picker');
  }

  const picker = sets.sets.length > 0;
  const value = selected ? `set:${selected.id}` : filtersOn ? 'unsaved' : 'all';
  const errorId = 'practice-set-name-error';

  return (
    <div class="practice-sets" ref={row} role="group" aria-label="Practice sets">
      {picker && (
        <>
          <label class="section-label" for="practice-set">Practice set</label>
          <span class="select-field">
            <select class="input" id="practice-set" name="practice-set" data-set-focus="picker" value={value}
              onChange={({ currentTarget }) => {
                const chosen = currentTarget.value;
                setMode(null);
                setMessage('');
                choose(chosen.startsWith('set:') ? chosen.slice(4) : null);
              }}>
              <option value="all">All problems</option>
              {value === 'unsaved' && <option value="unsaved" disabled>Unsaved filters</option>}
              {sets.sets.map((set) => <option key={set.id} value={`set:${set.id}`}>{set.name}</option>)}
            </select>
            <span class="chevron" aria-hidden="true" />
          </span>
        </>
      )}
      {mode === null && (filtersOn || selected) && (
        <div class="set-actions">
          {filtersOn && !selected && (
            <button type="button" class="button outline" data-set-focus="save" onClick={() => open('save')}>Save as set</button>
          )}
          {selected && changed && (
            <>
              <button type="button" class="button outline" data-set-focus="update"
                onClick={() => finish(update(), 'picker')}>Update set</button>
              <button type="button" class="button outline" data-set-focus="save-new" onClick={() => open('save')}>Save as new set</button>
            </>
          )}
          {selected && (
            <>
              <button type="button" class="button quiet" data-set-focus="rename" onClick={() => open('rename')}>Rename</button>
              <button type="button" class="button quiet" data-set-focus="delete" onClick={() => open('delete')}>Delete</button>
            </>
          )}
        </div>
      )}
      {(mode === 'save' || mode === 'rename') && (
        <form class="set-form" onSubmit={submit} onKeyDown={(event) => {
          if (event.key === 'Escape') close(mode === 'rename' ? 'rename' : selected ? 'save-new' : 'save');
        }}>
          <label class="set-label" for="practice-set-name">Set name</label>
          <input class="input" id="practice-set-name" name="set-name" type="text" autocomplete="off" enterKeyHint="done" data-set-focus="name"
            value={name} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? errorId : undefined}
            onInput={({ currentTarget }) => setName(currentTarget.value)} />
          {error && <p class="set-error" id={errorId}>{error}</p>}
          <div class="set-actions">
            <button type="submit" class="button outline">{mode === 'rename' ? 'Rename set' : 'Save set'}</button>
            <button type="button" class="button quiet"
              onClick={() => close(mode === 'rename' ? 'rename' : selected ? 'save-new' : 'save')}>Cancel</button>
          </div>
        </form>
      )}
      {mode === 'delete' && selected && (
        <div class="set-confirm" role="group" aria-labelledby="practice-set-delete">
          <p id="practice-set-delete">Delete “{selected.name}”? Your progress stays.</p>
          <div class="set-actions">
            <button type="button" class="button danger" onClick={() => finish(remove(), 'picker')}>Delete set</button>
            <button type="button" class="button outline" data-set-focus="keep" onClick={() => close('delete')}>Keep set</button>
          </div>
        </div>
      )}
      <p class="set-status" role="status">{message}</p>
    </div>
  );
}

export default function PracticeList({ problems }: { problems: CatalogProblem[] }) {
  const [currentFilters, setFilters] = useState<Filters | null>(null);
  const filters = currentFilters ?? emptyFilters;
  const attempts = useAttempts();
  const disclosure = useRef<HTMLDetailsElement>(null);
  const moreTopics = useRef<HTMLDetailsElement>(null);
  const searchField = useRef<HTMLInputElement>(null);
  const [markedRow, setMarkedRow] = useState<string | null>(null);
  const hashHandled = useRef(false);
  const earlierList = useRef<PracticeContext | null>(null);
  const published = useRef<Omit<PracticeContext, 'v'> | null>(null);
  // Undefined until read, null when storage is unavailable, which hides the set row.
  const [sets, setSets] = useState<PracticeSets | null | undefined>(undefined);
  // The set this tab shows or edits. A bare visit in a later tab applies the stored active one.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedSet = sets ? findPracticeSet(sets, selectedId) : undefined;

  // The list stored when the learner left, read before this page replaces it, so a row that has
  // since left the list (now solved under an Unattempted filter, say) can point to its neighbour.
  useEffect(() => {
    earlierList.current = readPracticeContext();
  }, []);

  const rows = useMemo<Row[]>(() => {
    const scores = bestScores(attempts);
    return problems.map((problem) => ({ ...problem, status: problemStatus(scores.get(problem.id)) }));
  }, [problems, attempts]);
  const options = useMemo(() => ({
    status: filterOptions(rows, 'status'),
    difficulty: filterOptions(rows, 'difficulty'),
    kind: filterOptions(rows, 'kind'),
    role: filterOptions(rows, 'role'),
  }), [rows]);
  const topics = useMemo(() => topicOptions(problems), [problems]);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 60rem)');
    const syncDisclosure = () => {
      if (disclosure.current) disclosure.current.open = wide.matches;
    };
    syncDisclosure();
    wide.addEventListener('change', syncDisclosure);
    return () => wide.removeEventListener('change', syncDisclosure);
  }, []);

  function revealTopics(next: Filters) {
    if (moreTopics.current && topics.slice(topicLimit).some(({ value }) => next.topic.includes(value))) {
      moreTopics.current.open = true;
    }
  }

  /** The saved set that lists the same problems as these filters. */
  function matchingSet(state: PracticeSets, next: Filters) {
    const key = filterKey(next);
    return state.sets.find((set) => filterKey(readFilters(topics, set.query)) === key);
  }

  useEffect(() => {
    const update = (first: boolean) => {
      let restored = readFilters(topics);
      if (first) {
        // A bare visit applies the active set. A list URL with filters keeps them, and names a saved
        // set only when it lists the same problems.
        const stored = readPracticeSets();
        const active = stored ? findPracticeSet(stored, stored.activeId) : undefined;
        let selection: string | null = null;
        let state = stored;
        if (active && !hasFilterParams(window.location.search)) {
          restored = readFilters(topics, active.query);
          const location = new URL(window.location.href);
          setFilterParams(location.searchParams, restored);
          window.history.replaceState(window.history.state, '', location);
          selection = active.id;
        } else if (stored && !filtersOff(restored)) {
          const match = matchingSet(stored, restored);
          selection = match?.id ?? null;
          if (match && stored.activeId !== match.id) {
            const chosen = choosePracticeSet(stored, match.id);
            if (writePracticeSets(chosen)) state = chosen;
          }
        }
        setSets(state);
        setSelectedId(selection);
      }
      setFilters(restored);
      revealTopics(restored);
    };
    update(true);
    const onPopState = () => update(false);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [topics]);

  // Another tab may save, rename or delete sets. This tab keeps its list and drops a deleted selection.
  useEffect(() => {
    const reread = () => {
      const next = readPracticeSets();
      setSets(next);
      setSelectedId((id) => (next && findPracticeSet(next, id) ? id : null));
    };
    const unsubscribe = onPracticeSetsChange(reread);
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) reread();
    };
    window.addEventListener('pageshow', onPageShow);
    return () => {
      unsubscribe();
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  function applyFilters(next: Filters) {
    setFilters(next);
    const location = new URL(window.location.href);
    setFilterParams(location.searchParams, next);
    window.history.replaceState(window.history.state, '', location);
  }

  /** Re-reads the stored sets, applies the change and stores it; null when storage refuses it. */
  function storeSets(change: (state: PracticeSets) => PracticeSets) {
    const current = readPracticeSets();
    if (!current) return null;
    const next = change(current);
    if (!writePracticeSets(next)) return null;
    setSets(next);
    return next;
  }

  function selectSet(id: string | null) {
    setSelectedId(id);
    if (sets && sets.activeId !== id) storeSets((state) => choosePracticeSet(state, id));
  }

  /**
   * Filters the learner changed. Clearing every filter means all problems, so no set stays chosen.
   * Filters that list the same problems as a saved set choose that set. Other changes keep the
   * chosen set, which then offers Update set.
   */
  function changeFilters(next: Filters) {
    applyFilters(next);
    if (!sets) return;
    if (filtersOff(next)) return selectSet(null);
    const match = matchingSet(sets, next);
    if (match) selectSet(match.id);
  }

  function clearFilters() {
    changeFilters(emptyFilters);
    if (disclosure.current?.open) searchField.current?.focus();
    else disclosure.current?.querySelector('summary')?.focus();
  }

  const storageFailure = { ok: false as const, message: 'The set could not be saved. Check your browser’s storage settings and try again.' };

  function chooseSet(id: string | null) {
    const set = sets && findPracticeSet(sets, id);
    const next = set ? readFilters(topics, set.query) : emptyFilters;
    applyFilters(next);
    revealTopics(next);
    selectSet(set ? set.id : null);
  }

  function saveSet(input: string): SetResult {
    if (!sets || !currentFilters) return storageFailure;
    const named = checkSetName(input, sets.sets);
    if (!named.ok) return { ...named, field: true };
    const next = storeSets((state) => addPracticeSet(state, named.name, filterQuery(savedFilters(currentFilters))));
    if (!next) return storageFailure;
    setSelectedId(next.activeId);
    return { ok: true, message: 'Set saved.' };
  }

  function updateSet(): SetResult {
    if (!selectedSet || !currentFilters) return storageFailure;
    const query = filterQuery(savedFilters(currentFilters));
    return storeSets((state) => changePracticeSet(state, selectedSet.id, { query }))
      ? { ok: true, message: 'Set updated.' }
      : storageFailure;
  }

  function renameSet(input: string): SetResult {
    if (!sets || !selectedSet) return storageFailure;
    const named = checkSetName(input, sets.sets, selectedSet.id);
    if (!named.ok) return { ...named, field: true };
    return storeSets((state) => changePracticeSet(state, selectedSet.id, { name: named.name }))
      ? { ok: true, message: 'Set renamed.' }
      : storageFailure;
  }

  function deleteSet(): SetResult {
    if (!selectedSet) return storageFailure;
    if (!storeSets((state) => deletePracticeSet(state, selectedSet.id))) return storageFailure;
    setSelectedId(null);
    return { ok: true, message: 'Set deleted.' };
  }

  function checkbox(key: Facet, { value, label, count }: Option) {
    const selected = filters[key];
    const countId = `practice-${key}-${value}-count`;
    return (
      <label class="check-row" key={value}>
        <input type="checkbox" name={key} value={value} checked={selected.includes(value)}
          disabled={currentFilters === null} aria-describedby={countId}
          onChange={({ currentTarget }) => changeFilters({
            ...filters,
            [key]: currentTarget.checked ? [...selected, value] : selected.filter((item) => item !== value),
          })} />
        <span>{label}</span>
        <span class="count" id={countId} aria-hidden="true">{count}<span class="visually-hidden"> {count === 1 ? 'problem' : 'problems'}</span></span>
      </label>
    );
  }

  const search = filters.q.trim().toLowerCase();
  const visible = rows.filter((row) =>
    facets.every((key) => !filters[key].length || facetValues(row, key).some((value) => filters[key].includes(value))) &&
    (!search || [row.title, displayTopic(row.topic), topicLabel(row.topic), kindLabel[row.kind]]
      .some((part) => part.toLowerCase().includes(search))));
  const visibleIds = visible.map(({ id }) => id).join(' ');

  // The chosen set names the list while the filters are still the set's own.
  const setShown = Boolean(selectedSet && currentFilters
    && filterKey(readFilters(topics, selectedSet.query)) === filterKey(currentFilters));
  const listLabel = !currentFilters ? '' : setShown ? selectedSet!.name : filterLabel(currentFilters);

  // Other pages follow this list: Previous, Next, the position line, the way back and Continue.
  useEffect(() => {
    if (!currentFilters) return;
    published.current = {
      query: filterQuery(currentFilters),
      label: listLabel,
      items: visible.map(({ id, title }) => [id, title]),
    };
    writePracticeContext(published.current);
    announceShownSet(setShown ? listLabel : null);
  }, [currentFilters, visibleIds, listLabel, setShown]);

  // A page restored from the back-forward cache shows the list it had, while another page may have
  // stored a different one since. Store this page's list again so links follow what is on screen.
  useEffect(() => {
    const republish = (event: PageTransitionEvent) => {
      if (event.persisted && published.current) writePracticeContext(published.current);
    };
    window.addEventListener('pageshow', republish);
    return () => window.removeEventListener('pageshow', republish);
  }, []);

  // A link back from a problem names its row in the hash: bring that row to the middle and mark it.
  // When that row has left the list, use the next one from the earlier list still shown, or the one before.
  useEffect(() => {
    if (!currentFilters || hashHandled.current) return;
    hashHandled.current = true;
    const hash = window.location.hash.slice(1);
    if (!hash.startsWith('row-')) return;
    let target = hash;
    const earlier = earlierList.current;
    const shown = new Set(visible.map(({ id }) => id));
    if (!visible.some(({ id }) => practiceRowId(id) === hash) && earlier) {
      const gone = earlier.items.find(([id]) => practiceRowId(id) === hash)?.[0];
      const nearest = gone && nearestShown(earlier, gone, (id) => shown.has(id));
      if (!nearest) return;
      target = practiceRowId(nearest);
    }
    const row = document.getElementById(target);
    if (!row?.closest('.catalog-table')) return;
    setMarkedRow(target);
    row.scrollIntoView({ block: 'center' });
    row.querySelector<HTMLAnchorElement>('.stretched-link')?.focus({ preventScroll: true });
  }, [currentFilters]);

  const activeLabel = currentFilters ? filterLabel(currentFilters) : '';
  const filtersOn = currentFilters !== null && !filtersOff(currentFilters);

  return (
    <div class="practice-layout">
      <aside class="filter-sidebar" aria-label="Practice sidebar">
        {sets && currentFilters && (sets.sets.length > 0 || filtersOn) && (
          <PracticeSetRow sets={sets} selected={selectedSet} changed={filtersOn && !setShown} filtersOn={filtersOn}
            suggestedName={activeLabel} choose={chooseSet} save={saveSet} update={updateSet} rename={renameSet} remove={deleteSet} />
        )}
        <details class="filter-disclosure" ref={disclosure} open>
          <summary>
            <span class="filter-summary">{activeLabel ? `Filters: ${activeLabel}` : 'Filters'}</span>
            <span class="chevron" aria-hidden="true" />
          </summary>
          <form class="filter-body" role="search" aria-label="Practice filters" onSubmit={(event) => event.preventDefault()}>
            <label for="practice-search" class="visually-hidden">Search</label>
            <input class="input" id="practice-search" type="search" name="q" ref={searchField}
              placeholder="Search problems" value={filters.q} disabled={currentFilters === null}
              onInput={({ currentTarget }) => changeFilters({ ...filters, q: currentTarget.value })} />
            {facets.map((key) => (
              <fieldset class="filter-group" key={key}>
                <legend>{groups[key].label}</legend>
                {(key === 'topic' ? topics.slice(0, topicLimit) : options[key]).map((option) => checkbox(key, option))}
                {key === 'topic' && topics.length > topicLimit && (
                  <details class="more-topics" ref={moreTopics}>
                    <summary>More topics <span class="chevron" aria-hidden="true" /></summary>
                    {topics.slice(topicLimit).map((option) => checkbox(key, option))}
                  </details>
                )}
              </fieldset>
            ))}
          </form>
        </details>
      </aside>
      <div class="practice-results">
        <p class="visually-hidden" role="status">{visible.length} {visible.length === 1 ? 'problem' : 'problems'} shown</p>
        {visible.length > 0 ? (
          <table class="catalog-table" role="table" aria-label="Practice problems">
            <thead class="visually-hidden" role="rowgroup">
              <tr role="row">
                <th scope="col" role="columnheader">Problem</th>
                <th scope="col" role="columnheader">Status</th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {visible.map(({ id, title, kind, topic, difficulty, minutes, status }) => {
                const rowId = practiceRowId(id);
                const marked = rowId === markedRow;
                return (
                  <tr class="row-card" data-card="" key={id} id={rowId} role="row" data-current={marked ? '' : undefined}>
                    <td role="cell">
                      <h2 class="catalog-title">
                        <a class="stretched-link" href={problemUrl(id)} aria-current={marked ? 'true' : undefined}>{title}</a>
                      </h2>
                      <p class="catalog-meta">
                        <span class={`catalog-difficulty difficulty ${difficulty}`}>{difficultyLabel[difficulty]}</span>
                        <span class="catalog-kind">{kindLabel[kind]}</span>
                        <span class="catalog-topic">{displayTopic(topic)}</span>
                        <span class="catalog-minutes num">{minutes} min</span>
                      </p>
                    </td>
                    <td class="catalog-action" role="cell">
                      <span class="catalog-status">
                        {status !== 'unattempted' && <span class={`chip ${status}`} data-chip="">{statusLabel[status]}</span>}
                      </span>
                      {status === 'unattempted' && <span class="button outline" aria-hidden="true">Solve</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div class="empty-state" data-card="">
            <p>No matching problems</p>
            <button type="button" class="button outline" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </div>
    </div>
  );
}
