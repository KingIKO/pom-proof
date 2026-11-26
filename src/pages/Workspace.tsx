import { lazy, Suspense, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ITEM_BY_ID, ITEMS } from '../content';
import { KIND_INFO, ROLE_INFO } from '../content/kinds';
import type { PracticeItem } from '../content/types';
import { Markdown } from '../components/Markdown';
import { StatusIcon } from '../components/Icons';
import { markItem, useStore } from '../lib/store';
import { SchemaPanel } from '../labs/SchemaPanel';
import { NotFound } from './NotFound';

const labs = {
  coding: lazy(() => import('../labs/CodingLab')),
  mutation: lazy(() => import('../labs/MutationLab')),
  locator: lazy(() => import('../labs/LocatorLab')),
  sql: lazy(() => import('../labs/SqlLab')),
  bughunt: lazy(() => import('../labs/BugHuntLab')),
  testdesign: lazy(() => import('../labs/TestDesignLab')),
  uilab: lazy(() => import('../labs/UiLab')),
  scenario: lazy(() => import('../labs/ScenarioLab')),
  diagnose: lazy(() => import('../labs/DiagnoseLab')),
  review: lazy(() => import('../labs/ReviewLab')),
};

export interface LabProps<T extends PracticeItem = PracticeItem> {
  item: T;
  /** Report an attempt. solved=true marks the item solved; score is 0-100. */
  onResult: (solved: boolean, score?: number) => void;
}

type Tab = 'description' | 'hints' | 'editorial';

function Extras({ item }: { item: PracticeItem }) {
  switch (item.kind) {
    case 'mutation':
      return (
        <>
          <h3 className="h3" style={{ marginTop: 20 }}>
            Contract
          </h3>
          <Markdown text={item.contract} />
        </>
      );
    case 'bughunt':
      return (
        <>
          <h3 className="h3" style={{ marginTop: 20 }}>
            Spec
          </h3>
          <Markdown text={item.spec} />
        </>
      );
    case 'sql':
      return <SchemaPanel dataset={item.dataset} />;
    default:
      return null;
  }
}

export default function Workspace() {
  const { id = '' } = useParams();
  const item = ITEM_BY_ID[id];
  const status = useStore((s) => s.items[id]?.status);
  const best = useStore((s) => s.items[id]?.best);
  const [tab, setTab] = useState<Tab>('description');
  const [revealed, setRevealed] = useState(false);
  const [shownHints, setShownHints] = useState(0);

  useEffect(() => {
    setTab('description');
    setRevealed(false);
    setShownHints(0);
    if (item) document.title = `${item.title} · POM Proof`;
    return () => {
      document.title = 'POM Proof';
    };
  }, [id, item]);

  if (!item) return <NotFound />;
  const Lab = labs[item.kind] as React.ComponentType<LabProps>;
  const idx = ITEMS.findIndex((i) => i.id === id);
  const prev = ITEMS[idx - 1];
  const next = ITEMS[idx + 1];
  const editorialOpen = status === 'solved' || revealed;
  const hasEditorial = !!(item.solutionNotes || item.interviewNotes || item.sources?.length);

  return (
    <div className="ws">
      <section className="ws-left" aria-label="Problem">
        <div className="ws-head">
          <div className="ws-crumbs">
            <Link to="/problems">Problems</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/problems?kind=${item.kind}`}>{KIND_INFO[item.kind].plural}</Link>
            <span style={{ flex: 1 }} />
            {prev && (
              <Link to={`/p/${prev.id}`} title={prev.title} className="btn btn--ghost btn--sm">
                Previous
              </Link>
            )}
            {next && (
              <Link to={`/p/${next.id}`} title={next.title} className="btn btn--ghost btn--sm">
                Next
              </Link>
            )}
          </div>
          <div className="ws-title-row">
            <h1 className="h2">{item.title}</h1>
            <StatusIcon status={status} />
          </div>
          <div className="ws-meta">
            <span className={`diff diff--${item.difficulty}`} style={{ alignSelf: 'center', marginRight: 4 }}>
              {item.difficulty}
            </span>
            {item.topics.map((t) => (
              <Link key={t} to={`/problems?topic=${encodeURIComponent(t)}`} className="tag">
                {t}
              </Link>
            ))}
            {best !== undefined && <span className="tag tag--accent num">Best {best}%</span>}
          </div>
        </div>
        <div className="tabs" role="tablist" style={{ marginTop: 12 }}>
          <button className="tab" role="tab" aria-selected={tab === 'description'} onClick={() => setTab('description')}>
            Description
          </button>
          {!!item.hints?.length && (
            <button className="tab" role="tab" aria-selected={tab === 'hints'} onClick={() => setTab('hints')}>
              Hints
            </button>
          )}
          {hasEditorial && (
            <button className="tab" role="tab" aria-selected={tab === 'editorial'} onClick={() => setTab('editorial')}>
              Editorial
            </button>
          )}
        </div>
        <div className="ws-scroll">
          {tab === 'description' && (
            <>
              <Markdown text={item.prompt} />
              <Extras item={item} />
              <p className="caption" style={{ marginTop: 24 }}>
                Common in: {item.roles.map((r) => ROLE_INFO[r].label).join(', ')}
              </p>
            </>
          )}
          {tab === 'hints' && item.hints && (
            <div>
              {item.hints.slice(0, shownHints).map((h, i) => (
                <div key={i} className="notice" style={{ marginBottom: 8 }}>
                  <span className="eyebrow">Hint {i + 1}</span>
                  <Markdown text={h} />
                </div>
              ))}
              {shownHints < item.hints.length ? (
                <button className="btn btn--sm" onClick={() => setShownHints((n) => n + 1)}>
                  Show hint {shownHints + 1} of {item.hints.length}
                </button>
              ) : (
                <p className="caption">That is every hint.</p>
              )}
            </div>
          )}
          {tab === 'editorial' &&
            (editorialOpen ? (
              <div>
                {item.solutionNotes && <Markdown text={item.solutionNotes} />}
                {item.interviewNotes && (
                  <>
                    <h3 className="h3" style={{ marginTop: 20 }}>
                      In the interview
                    </h3>
                    <Markdown text={item.interviewNotes} />
                  </>
                )}
                {!!item.sources?.length && (
                  <>
                    <h3 className="h3" style={{ marginTop: 20 }}>
                      Sources
                    </h3>
                    <ul className="small">
                      {item.sources.map((s) => (
                        <li key={s.url}>
                          <a href={s.url} target="_blank" rel="noreferrer">
                            {s.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ) : (
              <div className="notice">
                <p style={{ margin: '0 0 8px' }}>The editorial opens when you solve the problem. Reading it first makes the practice count for less.</p>
                <button className="btn btn--sm" onClick={() => setRevealed(true)}>
                  Show it anyway
                </button>
              </div>
            ))}
        </div>
      </section>
      <section className="ws-right" aria-label="Workspace">
        <Suspense fallback={<div className="empty">Loading the lab</div>}>
          <Lab key={item.id} item={item} onResult={(solved, score) => markItem(item.id, solved, score)} />
        </Suspense>
      </section>
    </div>
  );
}
