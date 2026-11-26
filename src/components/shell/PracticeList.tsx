import { useEffect, useState } from 'preact/hooks';
import type { CatalogProblem } from '../../lib/catalog';
import { difficultyLabel, kindLabel, problemStatus, roleLabel, statusLabel, topicLabel } from '../../lib/labels';
import { bestScores, onProgressChange, readProgress } from '../../lib/progress';
import type { ProgressAttempt } from '../../lib/contracts';
import { problemUrl } from '../../lib/url';

const facets = {
  kind: { label: 'Kind', options: kindLabel },
  difficulty: { label: 'Difficulty', options: difficultyLabel },
  role: { label: 'Role', options: roleLabel },
  status: { label: 'Status', options: statusLabel },
};
const filterKeys = Object.keys(facets) as Array<keyof typeof facets>;
const initialFilters = { q: '', kind: '', difficulty: '', role: '', status: '' };
type Filters = typeof initialFilters;

function readFilters(): Filters {
  const params = new URLSearchParams(window.location.search);
  const filters = { ...initialFilters, q: params.get('q') ?? '' };
  for (const key of filterKeys) {
    const value = params.get(key);
    if (value && Object.hasOwn(facets[key].options, value)) filters[key] = value;
  }
  return filters;
}

function nextProblem(problems: CatalogProblem[], attempts: ProgressAttempt[], scores: ReturnType<typeof bestScores>) {
  const catalogue = new Map(problems.map((problem) => [problem.id, problem]));
  let recent: { problem: CatalogProblem; date: number } | undefined;
  for (const { problemId, completedAt } of attempts) {
    const problem = catalogue.get(problemId);
    if (!problem || scores.get(problemId) === 1) continue;
    const date = Date.parse(completedAt);
    if (!recent || date >= recent.date) recent = { problem, date };
  }
  return recent?.problem ?? problems.find(({ id }) => scores.get(id) !== 1);
}

export default function PracticeList({ problems }: { problems: CatalogProblem[] }) {
  const [currentFilters, setFilters] = useState<Filters | null>(null);
  const filters = currentFilters ?? initialFilters;
  const [attempts, setAttempts] = useState<ProgressAttempt[]>([]);
  useEffect(() => {
    const updateProgress = () => setAttempts(readProgress().attempts);
    const updateFilters = () => setFilters(readFilters());
    updateProgress();
    updateFilters();
    const unsubscribe = onProgressChange(updateProgress);
    window.addEventListener('popstate', updateFilters);
    window.addEventListener('pageshow', updateProgress);
    return () => {
      unsubscribe();
      window.removeEventListener('popstate', updateFilters);
      window.removeEventListener('pageshow', updateProgress);
    };
  }, []);

  function changeFilter(key: keyof Filters, value: string) {
    setFilters((current) => ({ ...(current ?? initialFilters), [key]: value }));
    const location = new URL(window.location.href);
    if (value) location.searchParams.set(key, value);
    else location.searchParams.delete(key);
    window.history.replaceState(window.history.state, '', location);
  }

  const scores = bestScores(attempts);
  const next = nextProblem(problems, attempts, scores);
  const search = filters.q.trim().toLowerCase();
  const visible = problems.filter(({ id, kind, difficulty, roles, title, topic }) =>
    (!filters.kind || filters.kind === kind) &&
    (!filters.difficulty || filters.difficulty === difficulty) &&
    (!filters.role || roles.some((role) => role === filters.role)) &&
    (!filters.status || filters.status === problemStatus(scores.get(id))) &&
    (!search || [title, topicLabel(topic), kindLabel[kind]].some((part) => part.toLowerCase().includes(search))));

  return (
    <>
      {next && <p class="continue"><span>Continue</span> <a href={problemUrl(next.id)}>{next.title}</a></p>}
      <form class="practice-filters" role="search" aria-label="Practice filters" onSubmit={(event) => event.preventDefault()}>
        <label>
          Search
          <input type="search" name="q" value={filters.q} disabled={currentFilters === null}
            onInput={(event) => changeFilter('q', event.currentTarget.value)} />
        </label>
        {filterKeys.map((key) => (
          <label key={key}>
            {facets[key].label}
            <select name={key} value={filters[key]} disabled={currentFilters === null}
              onChange={(event) => changeFilter(key, event.currentTarget.value)}>
              <option value="">All</option>
              {Object.entries(facets[key].options).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
        ))}
      </form>
      <p class="visually-hidden" role="status">{visible.length} {visible.length === 1 ? 'problem' : 'problems'} shown</p>
      {visible.length > 0 ? (
        <table class="catalog-table" role="table" aria-label="Practice problems">
          <thead role="rowgroup">
            <tr role="row">
              <th scope="col" role="columnheader">Status</th>
              <th scope="col" role="columnheader">Title</th>
              <th scope="col" role="columnheader">Kind</th>
              <th scope="col" role="columnheader">Topic</th>
              <th scope="col" role="columnheader">Difficulty</th>
              <th scope="col" role="columnheader">Minutes</th>
            </tr>
          </thead>
          <tbody role="rowgroup">
            {visible.map(({ id, title, kind, topic, difficulty, minutes }) => {
              const status = problemStatus(scores.get(id));
              return (
                <tr key={id} role="row">
                  <td class="catalog-status" role="cell">{status !== 'unattempted' && statusLabel[status]}</td>
                  <td class="catalog-title" role="cell"><a href={problemUrl(id)}>{title}</a></td>
                  <td class="catalog-kind" role="cell">{kindLabel[kind]}</td>
                  <td class="catalog-topic" role="cell">{topicLabel(topic)}</td>
                  <td class="catalog-difficulty" role="cell">{difficultyLabel[difficulty]}</td>
                  <td class="catalog-minutes" role="cell">{minutes}<span> min</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : <p class="empty-state">No matching problems</p>}
    </>
  );
}
