import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import type { CatalogProblem } from '../../lib/catalog';
import type { ProgressAttempt } from '../../lib/contracts';
import { difficultyLabel, kindLabel, problemStatus, statusLabel, topicLabel } from '../../lib/labels';
import {
  latestPracticeContext, practiceContextEvent, practiceLabel, practiceRowId, writePracticeContext, type PracticeContext,
} from '../../lib/practice-context';
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

function readFilters(topics: readonly Option[]): Filters {
  const params = new URLSearchParams(window.location.search);
  const filters = { ...emptyFilters, q: params.get('q') ?? '' };
  for (const key of facets) {
    const values = new Set(params.get(key)?.split(',') ?? []);
    filters[key] = [...values].filter((value) => key === 'topic'
      ? topics.some((topic) => topic.value === value)
      : Object.hasOwn(groups[key].options, value));
  }
  return filters;
}

/** The filters as the list URL writes them, without the leading `?`. */
function filterQuery(filters: Filters) {
  const params = new URLSearchParams();
  for (const key of ['q', ...facets] as const) {
    const value = key === 'q' ? filters.q : filters[key].join(',');
    if (value) params.set(key, value);
  }
  return params.toString();
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

/** The problems the list shows right now, in its order; the whole catalog until the list reports its rows. */
function useShownProblems(problems: PracticeTarget[]) {
  const [context, setContext] = useState<PracticeContext | null>(null);
  useEffect(() => {
    setContext(latestPracticeContext());
    const update = (event: Event) => setContext((event as CustomEvent<PracticeContext>).detail);
    window.addEventListener(practiceContextEvent, update);
    return () => window.removeEventListener(practiceContextEvent, update);
  }, []);
  return useMemo(() => context?.items.map(([id, title]) => ({ id, title })) ?? problems, [context, problems]);
}

export function PracticeProgress({ problems }: { problems: PracticeTarget[] }) {
  const attempts = useAttempts();
  const shown = useShownProblems(problems);
  const scores = bestScores(attempts);
  const solved = problems.filter(({ id }) => scores.get(id) === 1).length;
  const next = nextProblem(shown, attempts, scores);

  return (
    <div class="practice-actions">
      <div class="progress-meter practice-progress">
        <span id="practice-solved"><strong>{solved}</strong> of {problems.length} solved</span>
        <progress class="progress-bar" aria-labelledby="practice-solved" value={solved} max={problems.length} />
      </div>
      {next && (
        <a class="button primary practice-continue" href={problemUrl(next.id)} aria-label={`Continue: ${next.title}`}>
          Continue <span class="chevron right" aria-hidden="true" />
        </a>
      )}
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

  useEffect(() => {
    const update = () => {
      const restored = readFilters(topics);
      setFilters(restored);
      if (moreTopics.current && topics.slice(topicLimit).some(({ value }) => restored.topic.includes(value))) {
        moreTopics.current.open = true;
      }
    };
    update();
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, [topics]);

  function applyFilters(next: Filters) {
    setFilters(next);
    const location = new URL(window.location.href);
    for (const key of ['q', ...facets] as const) {
      const value = key === 'q' ? next.q : next[key].join(',');
      if (value) location.searchParams.set(key, value);
      else location.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', location);
  }

  function clearFilters() {
    applyFilters(emptyFilters);
    if (disclosure.current?.open) searchField.current?.focus();
    else disclosure.current?.querySelector('summary')?.focus();
  }

  function checkbox(key: Facet, { value, label, count }: Option) {
    const selected = filters[key];
    const countId = `practice-${key}-${value}-count`;
    return (
      <label class="check-row" key={value}>
        <input type="checkbox" name={key} value={value} checked={selected.includes(value)}
          disabled={currentFilters === null} aria-describedby={countId}
          onChange={({ currentTarget }) => applyFilters({
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

  // Other pages follow this list: Previous, Next, the position line, the way back and Continue.
  useEffect(() => {
    if (!currentFilters) return;
    writePracticeContext({
      query: filterQuery(currentFilters),
      label: filterLabel(currentFilters),
      items: visible.map(({ id, title }) => [id, title]),
    });
  }, [currentFilters, visibleIds]);

  // A link back from a problem names its row in the hash: bring that row to the middle and mark it.
  useEffect(() => {
    if (!currentFilters || hashHandled.current) return;
    hashHandled.current = true;
    const hash = window.location.hash.slice(1);
    const row = hash.startsWith('row-') ? document.getElementById(hash) : null;
    if (!row?.closest('.catalog-table')) return;
    setMarkedRow(hash);
    row.scrollIntoView({ block: 'center' });
    row.querySelector<HTMLAnchorElement>('.stretched-link')?.focus({ preventScroll: true });
  }, [currentFilters]);

  return (
    <div class="practice-layout">
      <aside class="filter-sidebar" aria-label="Practice sidebar">
        <details class="filter-disclosure" ref={disclosure} open>
          <summary>Filters <span class="chevron" aria-hidden="true" /></summary>
          <form class="filter-body" role="search" aria-label="Practice filters" onSubmit={(event) => event.preventDefault()}>
            <label for="practice-search" class="visually-hidden">Search</label>
            <input class="input" id="practice-search" type="search" name="q" ref={searchField}
              placeholder="Search problems" value={filters.q} disabled={currentFilters === null}
              onInput={({ currentTarget }) => applyFilters({ ...filters, q: currentTarget.value })} />
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
