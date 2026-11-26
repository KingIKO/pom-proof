import { useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ITEMS, ALL_TOPICS } from '../content';
import { KIND_INFO, KIND_ORDER, ROLE_INFO } from '../content/kinds';
import type { Kind, Role, Difficulty } from '../content/types';
import { useStore } from '../lib/store';
import { StatusIcon } from '../components/Icons';

export function Problems() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const progress = useStore((s) => s.items);
  const q = params.get('q') ?? '';
  const kind = (params.get('kind') ?? '') as Kind | '';
  const diff = (params.get('difficulty') ?? '') as Difficulty | '';
  const role = (params.get('role') ?? '') as Role | '';
  const topic = params.get('topic') ?? '';
  const status = params.get('status') ?? '';

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ITEMS.filter((i) => {
      if (kind && i.kind !== kind) return false;
      if (diff && i.difficulty !== diff) return false;
      if (role && !i.roles.includes(role)) return false;
      if (topic && !i.topics.includes(topic)) return false;
      const st = progress[i.id]?.status;
      if (status === 'solved' && st !== 'solved') return false;
      if (status === 'todo' && st === 'solved') return false;
      if (needle && !`${i.title} ${i.summary} ${i.topics.join(' ')}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, kind, diff, role, topic, status, progress]);

  const counts = useMemo(() => {
    const c: Partial<Record<Kind, number>> = {};
    for (const i of ITEMS) c[i.kind] = (c[i.kind] ?? 0) + 1;
    return c;
  }, []);

  const filtered = !!(q || kind || diff || role || topic || status);
  const solvedHere = rows.filter((r) => progress[r.id]?.status === 'solved').length;

  return (
    <div className="page">
      <h1 className="h1">Problems</h1>
      <p className="lede">Every problem is graded in your browser. Pick a kind of round to drill, or filter by the role you are interviewing for.</p>

      <div className="segmented" role="group" aria-label="Kind" style={{ marginTop: 24, flexWrap: 'wrap' }}>
        <button aria-pressed={!kind} onClick={() => set('kind', '')}>
          All <span className="muted num">{ITEMS.length}</span>
        </button>
        {KIND_ORDER.filter((k) => counts[k]).map((k) => (
          <button key={k} aria-pressed={kind === k} onClick={() => set('kind', k)}>
            {KIND_INFO[k].plural} <span className="muted num">{counts[k]}</span>
          </button>
        ))}
      </div>

      {kind && <p className="small muted" style={{ margin: '12px 0 0', maxWidth: 680 }}>{KIND_INFO[kind].blurb}</p>}

      <div className="list-toolbar">
        <input className="input" type="search" placeholder="Search problems" value={q} onChange={(e) => set('q', e.target.value)} aria-label="Search problems" />
        <select className="select" value={diff} onChange={(e) => set('difficulty', e.target.value)} aria-label="Difficulty">
          <option value="">Any difficulty</option>
          <option>Easy</option>
          <option>Medium</option>
          <option>Hard</option>
        </select>
        <select className="select" value={role} onChange={(e) => set('role', e.target.value)} aria-label="Role">
          <option value="">Any role</option>
          {(Object.keys(ROLE_INFO) as Role[]).map((r) => (
            <option key={r} value={r}>
              {ROLE_INFO[r].label}
            </option>
          ))}
        </select>
        <select className="select" value={topic} onChange={(e) => set('topic', e.target.value)} aria-label="Topic">
          <option value="">Any topic</option>
          {ALL_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select className="select" value={status} onChange={(e) => set('status', e.target.value)} aria-label="Status">
          <option value="">Any status</option>
          <option value="todo">Not solved</option>
          <option value="solved">Solved</option>
        </select>
        {filtered && (
          <button className="btn btn--ghost btn--sm" onClick={() => setParams({}, { replace: true })}>
            Clear filters
          </button>
        )}
        <span className="caption num" style={{ marginLeft: 'auto' }}>
          {solvedHere} of {rows.length} solved
        </span>
      </div>

      {rows.length === 0 ? (
        <div className="empty">No problems match these filters.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th className="col-status">
                <span className="sr-only">Status</span>
              </th>
              <th>Title</th>
              <th className="col-kind">Kind</th>
              <th className="col-diff">Difficulty</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i.id} onClick={() => navigate(`/p/${i.id}`)}>
                <td>
                  <StatusIcon status={progress[i.id]?.status} />
                </td>
                <td className="title-cell">
                  <Link to={`/p/${i.id}`} onClick={(e) => e.stopPropagation()}>
                    {i.title}
                  </Link>
                  <span className="caption">{i.summary}</span>
                </td>
                <td className="col-kind small muted">{KIND_INFO[i.kind].label}</td>
                <td>
                  <span className={`diff diff--${i.difficulty}`}>{i.difficulty}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
