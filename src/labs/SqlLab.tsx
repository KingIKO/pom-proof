import { useState } from 'react';
import type { LabProps } from '../pages/Workspace';
import type { SqlItem } from '../content/types';
import { Editor } from '../components/Editor';
import { runSql, type SqlRun } from '../runners/sql';
import type { ResultSet } from '../runners/sqlCompare';
import { useDraft, Verdict, ErrorBox, Running, MOD_KEY } from './shared';

function ResultTable({ rs, max = 100 }: { rs: ResultSet; max?: number }) {
  if (!rs.columns.length) return <p className="small muted">The query ran and returned no result set.</p>;
  return (
    <div className="md-table-wrap md">
      <table>
        <thead>
          <tr>
            {rs.columns.map((c, i) => (
              <th key={i}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rs.values.slice(0, max).map((r, i) => (
            <tr key={i}>
              {r.map((v, j) => (
                <td key={j} className="num" style={v === null ? { color: 'var(--label-4)' } : undefined}>
                  {v === null ? 'NULL' : String(v)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rs.values.length > max && <p className="caption">Showing {max} of {rs.values.length} rows.</p>}
      {rs.values.length === 0 && <p className="caption">0 rows.</p>}
    </div>
  );
}

export default function SqlLab({ item, onResult }: LabProps<SqlItem>) {
  const [code, setCode, reset] = useDraft(`${item.id}:sql`, '-- Write your query\nSELECT ');
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<(SqlRun & { mode: 'run' | 'submit' }) | null>(null);
  const [showExpected, setShowExpected] = useState(false);

  const exec = async (mode: 'run' | 'submit') => {
    setBusy(true);
    setShowExpected(false);
    try {
      const r = await runSql(item.dataset, code, mode === 'submit' ? item.answer : undefined, item.orderMatters);
      setOut({ ...r, mode });
      if (mode === 'submit') onResult(!!r.verdict?.passed, r.verdict?.passed ? 100 : 0);
    } catch (e) {
      setOut({ mode, error: String(e), ms: 0 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="split-v">
      <div className="ws-toolbar">
        <span className="small muted">SQLite</span>
        <button className="btn btn--ghost btn--sm" onClick={reset}>
          Reset
        </button>
        <span className="grow" />
        <span className="caption">
          <kbd>{MOD_KEY}</kbd> <kbd>Enter</kbd> runs
        </span>
        <button className="btn" onClick={() => exec('run')} disabled={busy}>
          Run
        </button>
        <button className="btn btn--primary" onClick={() => exec('submit')} disabled={busy}>
          Submit
        </button>
      </div>
      <div className="ws-editor">
        <Editor value={code} lang="sql" onChange={setCode} onRun={() => exec('run')} label="SQL query" />
      </div>
      <div className="ws-console">
        <div className="ws-scroll">
          {busy && <Running />}
          {!busy && !out && <p className="muted small">Run shows your result. Submit compares it with the expected rows{item.orderMatters ? ', in order' : ''}. Column names do not matter.</p>}
          {out?.error && <ErrorBox message={out.error} />}
          {out?.verdict && (
            <Verdict ok={out.verdict.passed} title={out.verdict.passed ? 'Accepted' : 'Wrong result'} detail={out.verdict.reason} />
          )}
          {out?.result && <ResultTable rs={out.result} />}
          {out?.verdict && !out.verdict.passed && (
            <div style={{ marginTop: 12 }}>
              {showExpected ? (
                <>
                  <div className="kv-label">Expected result</div>
                  <ResultTable rs={out.verdict.expected} />
                </>
              ) : (
                <button className="btn btn--sm" onClick={() => setShowExpected(true)}>
                  Show expected result
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
