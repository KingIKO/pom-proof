import type { Database, QueryResult, SqlValue } from 'sql.js';

interface SqlStatement {
  getColumnNames(): string[];
  step(): boolean;
  get(): SqlValue[];
}

declare module 'sql.js' {
  interface Database {
    iterateStatements(sql: string): Iterator<SqlStatement, undefined> & { return(): void };
  }
}

export type SqlTable = QueryResult;
export type SchemaTable = { name: string; columns: Array<{ name: string; type: string }> };
export type SqlLoader = () => Promise<{ Database: new () => Database }>;
export type SqlRunner = ReturnType<typeof createSqlRunner>;

export const SQL_WORKER_TIMEOUT_MS = 2_000;

export class SqlTimeoutError extends Error {
  constructor() {
    super(`Stopped after ${SQL_WORKER_TIMEOUT_MS / 1000} seconds. Look for a recursive query that never ends.`);
  }
}

type SqlMethod = keyof SqlRunner;
export type SqlWorkerRequest<M extends SqlMethod = SqlMethod> = {
  [K in M]: { method: K; args: Parameters<SqlRunner[K]> };
}[M];
export type SqlWorkerValue<M extends SqlMethod> = Awaited<ReturnType<SqlRunner[M]>>;
export type SqlWorkerReply = {
  [K in SqlMethod]: { method: K; value: SqlWorkerValue<K> };
}[SqlMethod] | { error: string };

function singleQuery(db: Database, query: string): SqlTable {
  const statements = db.iterateStatements(query);
  let exhausted = false;
  try {
    const first = statements.next();
    if (first.done) {
      exhausted = true;
      throw new Error('Enter one query that returns rows.');
    }
    const statement = first.value;
    const columns = statement.getColumnNames();
    if (!columns.length) throw new Error('Enter one query that returns rows.');
    const values: SqlValue[][] = [];
    while (statement.step()) values.push(statement.get());
    exhausted = !!statements.next().done;
    if (!exhausted) throw new Error('Enter one query at a time.');
    return { columns, values };
  } finally {
    if (!exhausted) statements.return();
  }
}

export function createSqlRunner(load: SqlLoader) {
  async function withDatabase<T>(schema: string, seed: string, read: (db: Database) => T): Promise<T> {
    const { Database } = await load();
    const db = new Database();
    try {
      db.exec(schema);
      if (seed) db.exec(seed);
      db.exec('PRAGMA query_only = ON');
      return read(db);
    } finally {
      db.close();
    }
  }

  return {
    query: (schema: string, seed: string, query: string) =>
      withDatabase(schema, seed, (db) => singleQuery(db, query)),
    compare: (schema: string, seed: string, reference: string, query: string) =>
      withDatabase(schema, seed, (db) => ({
        expected: singleQuery(db, reference),
        actual: singleQuery(db, query),
      })),
    schema: (schema: string): Promise<SchemaTable[]> => withDatabase(schema, '', (db) => {
      const { values } = singleQuery(db, `
        SELECT m.name, p.name, p.type
        FROM sqlite_schema m JOIN pragma_table_info(m.name) p
        WHERE m.type = 'table' AND m.name NOT GLOB 'sqlite_*'
        ORDER BY m.name, p.cid
      `);
      const tables = new Map<string, SchemaTable>();
      for (const [table, column, type] of values) {
        if (typeof table !== 'string' || typeof column !== 'string' || typeof type !== 'string') continue;
        if (!tables.has(table)) tables.set(table, { name: table, columns: [] });
        tables.get(table)!.columns.push({ name: column, type });
      }
      return [...tables.values()];
    }),
  };
}

function rowKey(row: SqlValue[]): string {
  return JSON.stringify(row.map((cell) => {
    if (typeof cell === 'number') {
      return Number.isFinite(cell) ? Number(cell.toFixed(2)) : { number: String(cell) };
    }
    return cell instanceof Uint8Array ? [...cell] : cell;
  }));
}

export function sameRows(actual: SqlTable, expected: SqlTable, ordered: boolean): boolean {
  if (actual.columns.length !== expected.columns.length || actual.values.length !== expected.values.length) return false;
  const actualRows = actual.values.map(rowKey);
  const expectedRows = expected.values.map(rowKey);
  if (!ordered) {
    actualRows.sort();
    expectedRows.sort();
  }
  return actualRows.every((row, i) => row === expectedRows[i]);
}

export function hasOutputOrder(query: string): boolean {
  const tokens = /--[^\r\n]*|\/\*[\s\S]*?\*\/|'(?:''|[^'])*'|"(?:\"\"|[^"])*"|`(?:``|[^`])*`|\[[^\]]*\]|[\w$]+|[^\s]/g;
  let depth = 0;
  let order = false;
  for (const [token] of query.matchAll(tokens)) {
    if (token.startsWith('--') || token.startsWith('/*')) continue;
    if (token === '(') depth++;
    if (token === ')') depth--;
    if (depth !== 0) continue;
    const word = token.toUpperCase();
    if (order && word === 'BY') return true;
    order = word === 'ORDER';
  }
  return false;
}
