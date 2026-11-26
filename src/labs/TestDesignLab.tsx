import { useState } from 'react';
import type { DesignRow, FieldDef, TestDesignItem } from '../content/types';
import type { LabProps } from '../pages/Workspace';
import { useDraft, Verdict } from './shared';
import './forms.css';

type Row = { id: number; values: DesignRow; expected: string };
type Cell = DesignRow[string];

function newRow(fields: FieldDef[], id: number): Row {
  return { id, values: Object.fromEntries(fields.map(({ name, type }) => [name, type === 'boolean' ? false : ''])), expected: '' };
}

function readRows(draft: string, item: TestDesignItem): Row[] {
  try {
    const rows: unknown = JSON.parse(draft);
    if (!Array.isArray(rows)) return [newRow(item.fields, 1)];
    const seen = new Set<number>();
    return rows.flatMap((row: Partial<Row> | null) => {
      if (!row || typeof row.id !== 'number' || !Number.isSafeInteger(row.id) || seen.has(row.id)) return [];
      seen.add(row.id);
      const fresh = newRow(item.fields, row.id);
      for (const field of item.fields) {
        const value = row.values?.[field.name];
        if ((field.type === 'boolean' && typeof value === 'boolean') ||
            (field.type === 'number' && typeof value === 'number' && Number.isFinite(value)) ||
            (field.type === 'text' && typeof value === 'string') ||
            (field.type === 'select' && typeof value === 'string' && field.options.includes(value))) {
          fresh.values[field.name] = value;
        }
      }
      fresh.expected = typeof row.expected === 'string' && item.outcomes.includes(row.expected) ? row.expected : '';
      return [fresh];
    });
  } catch {
    return [newRow(item.fields, 1)];
  }
}

function pairCoverage(fields: FieldDef[], rows: Row[]) {
  const factors = fields.flatMap<{ name: string; values: Cell[] }>((field) => {
    if (field.type === 'select') return [{ name: field.name, values: field.options }];
    if (field.type === 'boolean') return [{ name: field.name, values: [false, true] }];
    return [];
  });
  let total = 0;
  let covered = 0;
  for (const [i, left] of factors.entries()) {
    for (const right of factors.slice(i + 1)) {
      for (const a of left.values) {
        for (const b of right.values) {
          total += 1;
          if (rows.some(({ values }) => values[left.name] === a && values[right.name] === b)) covered += 1;
        }
      }
    }
  }
  return { total, covered };
}

function grade(item: TestDesignItem, rows: Row[]) {
  const correct = rows.map(({ values, expected }) => item.oracle(values) === expected);
  const right = correct.filter(Boolean).length;
  const covered = item.partitions.filter((partition) => rows.some(({ values }) => partition.matches(values)));
  const missing = item.partitions.filter((partition) => !covered.includes(partition));
  const bugs = item.mutants.filter((mutant) => rows.some(({ values, expected }, i) => correct[i] && mutant.fn(values) !== expected));
  const pairs = item.technique === 'Pairwise' ? pairCoverage(item.fields, rows) : null;
  const coverage = pairs ?? { covered: covered.length, total: item.partitions.length };
  const share = (n: number, total: number) => total === 0 ? 1 : n / total;
  const rowBudget = pairs ? item.targetRows ?? rows.length : item.partitions.length;
  const penalty = rowBudget > 0 ? Math.min(10, 2 * Math.max(0, rows.length - 2 * rowBudget)) : 0;
  const score = Math.round(40 * share(coverage.covered, coverage.total) + 40 * share(bugs.length, item.mutants.length) + 20 * right / rows.length - penalty);
  const solved = coverage.covered === coverage.total && bugs.length === item.mutants.length && right === rows.length;
  return { score: Math.max(0, score), solved, covered, missing, bugs, correct, right, pairs, penalty };
}

function RowInput({ field, value, label, change }: { field: FieldDef; value: Cell; label: string; change: (value: Cell) => void }) {
  if (field.type === 'boolean') {
    return <input type="checkbox" aria-label={label} checked={value === true} onChange={(e) => change(e.currentTarget.checked)} />;
  }
  if (field.type === 'select') {
    return (
      <select className="select" aria-label={label} value={String(value)} onChange={(e) => change(e.currentTarget.value)}>
        <option value="" disabled>Choose</option>
        {field.options.map((option) => <option key={option}>{option}</option>)}
      </select>
    );
  }
  return (
    <input
      className="input"
      aria-label={label}
      type={field.type}
      step={field.type === 'number' ? 'any' : undefined}
      value={String(value)}
      onChange={(e) => {
        const input = e.currentTarget;
        change(field.type === 'text' ? input.value : input.value === '' ? '' : input.valueAsNumber);
      }}
    />
  );
}

export default function TestDesignLab({ item, onResult }: LabProps<TestDesignItem>) {
  const [draft, save] = useDraft(`${item.id}:design:v1`, JSON.stringify([newRow(item.fields, 1)]));
  const [report, setReport] = useState<ReturnType<typeof grade> | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const rows = readRows(draft, item);
  const ready = rows.length > 0 && rows.every((row) => row.expected && item.fields.every((field) => field.type !== 'select' || row.values[field.name] !== ''));

  function edit(next: Row[]) {
    setReport(null);
    save(JSON.stringify(next));
  }

  function update(row: Row, data: Partial<Row>) {
    edit(rows.map((current) => current.id === row.id ? { ...current, ...data } : current));
  }

  function check() {
    if (!ready) return;
    const result = grade(item, rows);
    setShowMissing(false);
    setReport(result);
    onResult(result.solved, result.score);
  }

  return (
    <div className="split-v">
      <div className="ws-scroll forms-lab">
        <header className="forms-stack">
          <h2 className="h3">{item.technique}</h2>
          <p className="small muted">Add inputs and choose the expected outcome for each row.</p>
        </header>
        {rows.length > 0 && (
          <div className="forms-table-wrap" tabIndex={0} role="region" aria-label="Test rows">
            <table className="design-table">
              <thead>
                <tr>
                  <th scope="col">Row</th>
                  {item.fields.map((field) => <th scope="col" key={field.name}>{field.label}</th>)}
                  <th scope="col">Expected outcome</th>
                  {report && <th scope="col">Result</th>}
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className={report?.correct[i] === false ? 'forms-row-wrong' : undefined}>
                    <th scope="row">{i + 1}</th>
                    {item.fields.map((field) => (
                      <td key={field.name}>
                        <RowInput field={field} value={row.values[field.name]} label={`${field.label}, row ${i + 1}`} change={(value) => update(row, { values: { ...row.values, [field.name]: value } })} />
                      </td>
                    ))}
                    <td>
                      <select className="select" aria-label={`Expected outcome, row ${i + 1}`} value={row.expected} onChange={(e) => update(row, { expected: e.currentTarget.value })}>
                        <option value="" disabled>Choose</option>
                        {item.outcomes.map((outcome) => <option key={outcome}>{outcome}</option>)}
                      </select>
                    </td>
                    {report && <td><span className={report.correct[i] ? 'pass' : 'fail'}>{report.correct[i] ? 'Correct' : 'Incorrect'}</span></td>}
                    <td><button className="btn btn--ghost btn--sm" type="button" aria-label={`Remove row ${i + 1}`} onClick={() => edit(rows.filter(({ id }) => id !== row.id))}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="btn-row">
          <button type="button" className="btn" onClick={() => edit([...rows, newRow(item.fields, Math.max(0, ...rows.map(({ id }) => id)) + 1)])}>Add row</button>
          <button type="button" className="btn btn--primary" disabled={!ready} onClick={check}>Check design</button>
          {!ready && <span className="caption">{rows.length ? 'Choose the remaining values and outcomes.' : 'Add a row to check the design.'}</span>}
        </div>
        {report && (
          <section className="forms-stack" aria-label="Design results">
            <Verdict ok={report.solved || 'partial'} title={report.solved ? 'Design complete' : 'Design needs work'} detail={`${report.score}% · ${report.right} of ${rows.length} correct expectations`} />
            {report.pairs ? (
              <p><strong>{report.pairs.covered} of {report.pairs.total} value pairs covered</strong>{item.targetRows !== undefined && <span className="small muted"> · {rows.length} rows, target {item.targetRows}</span>}</p>
            ) : (
              <>
                <p><strong>{report.covered.length} of {item.partitions.length} partitions covered</strong></p>
                <ul className="forms-result-list small">
                  {report.covered.map(({ id, label }) => <li key={id}>{label} <span className="pass">· Covered</span></li>)}
                  {showMissing && report.missing.map(({ id, label }) => <li key={id}>{label} <span className="fail">· Uncovered</span></li>)}
                </ul>
                {report.missing.length > 0 && (
                  <div><button type="button" className="btn btn--sm" aria-expanded={showMissing} onClick={() => setShowMissing((shown) => !shown)}>{showMissing ? 'Hide missing partitions' : 'Show what is missing'}</button></div>
                )}
              </>
            )}
            <p><strong>{report.bugs.length} of {item.mutants.length} bugs caught</strong></p>
            {report.bugs.length > 0 && <ul className="forms-result-list small">{report.bugs.map(({ id, label }) => <li key={id}>{label}</li>)}</ul>}
            {report.penalty > 0 && <p className="caption">{report.penalty} points deducted for extra rows.</p>}
          </section>
        )}
      </div>
    </div>
  );
}
