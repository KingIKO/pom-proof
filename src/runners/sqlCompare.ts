export type Cell = string | number | null | Uint8Array;
export interface ResultSet {
  columns: string[];
  values: Cell[][];
}

function norm(v: Cell): string {
  if (v === null) return 'null';
  if (typeof v === 'number') return Number.isInteger(v) ? String(v) : String(Math.round(v * 100) / 100);
  if (v instanceof Uint8Array) return `blob:${v.length}`;
  return JSON.stringify(v);
}

/**
 * Compares values, not column names: aliases are the candidate's choice.
 * Floats compare to two decimals. Without orderMatters rows compare as a multiset.
 */
export function compareResultSets(got: ResultSet, want: ResultSet, orderMatters: boolean): { passed: boolean; reason?: string } {
  if (got.columns.length !== want.columns.length) {
    return { passed: false, reason: `Expected ${want.columns.length} column${want.columns.length === 1 ? '' : 's'}, got ${got.columns.length}.` };
  }
  if (got.values.length !== want.values.length) {
    return { passed: false, reason: `Expected ${want.values.length} row${want.values.length === 1 ? '' : 's'}, got ${got.values.length}.` };
  }
  const g = got.values.map((r) => r.map(norm).join('|'));
  const w = want.values.map((r) => r.map(norm).join('|'));
  if (orderMatters) {
    const i = g.findIndex((row, idx) => row !== w[idx]);
    if (i === -1) return { passed: true };
    const sorted = [...g].sort().join('\n') === [...w].sort().join('\n');
    return { passed: false, reason: sorted ? 'Right rows, wrong order. Check ORDER BY.' : `Row ${i + 1} differs from the expected result.` };
  }
  const gs = [...g].sort();
  const ws = [...w].sort();
  const i = gs.findIndex((row, idx) => row !== ws[idx]);
  return i === -1 ? { passed: true } : { passed: false, reason: 'The rows differ from the expected result.' };
}
