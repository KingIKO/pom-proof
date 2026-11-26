import { useEffect, useState } from 'react';
import { DATASETS } from '../content/sql/datasets';

type TableInfo = { name: string; cols: { name: string; type: string }[]; count: number };

/** Lists the tables and columns of an SQL dataset under the problem text. */
export function SchemaPanel({ dataset }: { dataset: string }) {
  const [tables, setTables] = useState<TableInfo[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    import('../runners/sql')
      .then((m) => m.describeDataset(dataset))
      .then((t) => live && setTables(t))
      .catch((e) => live && setErr(String(e)));
    return () => {
      live = false;
    };
  }, [dataset]);
  const ds = DATASETS[dataset];
  return (
    <div style={{ marginTop: 20 }}>
      <h3 className="h3">Dataset: {ds?.name}</h3>
      <p className="small muted" style={{ margin: '4px 0 12px' }}>
        {ds?.description} SQLite dialect.
      </p>
      {err && <p className="small fail">{err}</p>}
      {!tables && !err && <p className="small muted">Loading schema…</p>}
      {tables && (
        <div style={{ display: 'grid', gap: 10 }}>
          {tables.map((t) => (
            <div key={t.name} className="panel" style={{ padding: '8px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <code style={{ fontWeight: 600, fontSize: 13 }}>{t.name}</code>
                <span className="caption num">{t.count} rows</span>
              </div>
              <div className="caption" style={{ fontFamily: 'var(--font-code)', marginTop: 4 }}>
                {t.cols.map((c) => `${c.name} ${c.type.toLowerCase()}`).join(', ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
