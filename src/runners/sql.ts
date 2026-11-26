import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { DATASETS } from '../content/sql/datasets';
import { compareResultSets, type ResultSet } from './sqlCompare';

let sqlPromise: Promise<SqlJsStatic> | null = null;

function getSql() {
  if (!sqlPromise) sqlPromise = initSqlJs({ locateFile: () => wasmUrl });
  return sqlPromise;
}

async function openDataset(id: string): Promise<Database> {
  const SQL = await getSql();
  const ds = DATASETS[id];
  if (!ds) throw new Error(`Unknown dataset ${id}`);
  const db = new SQL.Database();
  db.run(ds.seed);
  return db;
}

function execOne(db: Database, query: string): ResultSet {
  const res = db.exec(query);
  if (res.length === 0) return { columns: [], values: [] };
  const last = res[res.length - 1];
  return { columns: last.columns, values: last.values as ResultSet['values'] };
}

export interface SqlRun {
  result?: ResultSet;
  error?: string;
  verdict?: { passed: boolean; reason?: string; expected: ResultSet };
  ms: number;
}

/** Runs the user's query. With an answer, also grades it against the reference. */
export async function runSql(dataset: string, query: string, answer?: string, orderMatters = false): Promise<SqlRun> {
  const start = performance.now();
  const db = await openDataset(dataset);
  try {
    if (!query.trim()) return { error: 'Write a query first.', ms: 0 };
    let result: ResultSet;
    try {
      result = execOne(db, query);
    } catch (e) {
      return { error: e instanceof Error ? e.message : String(e), ms: performance.now() - start };
    }
    if (!answer) return { result, ms: performance.now() - start };
    const fresh = await openDataset(dataset);
    const expected = execOne(fresh, answer);
    fresh.close();
    const cmp = compareResultSets(result, expected, orderMatters);
    return { result, verdict: { ...cmp, expected }, ms: performance.now() - start };
  } finally {
    db.close();
  }
}

export async function describeDataset(id: string) {
  const db = await openDataset(id);
  try {
    const tables = execOne(db, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").values.map((r) => String(r[0]));
    return tables.map((t) => {
      const cols = execOne(db, `PRAGMA table_info(${t})`).values.map((r) => ({ name: String(r[1]), type: String(r[2]) }));
      const count = Number(execOne(db, `SELECT COUNT(*) FROM ${t}`).values[0][0]);
      return { name: t, cols, count };
    });
  } finally {
    db.close();
  }
}

export async function previewTable(id: string, table: string, limit = 50): Promise<ResultSet> {
  const db = await openDataset(id);
  try {
    return execOne(db, `SELECT * FROM ${table} LIMIT ${limit}`);
  } finally {
    db.close();
  }
}
