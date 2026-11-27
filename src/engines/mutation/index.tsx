import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type CodeEditor from '../../components/editor/CodeEditor';
import ResultPanel from '../../components/shell/ResultPanel';
import type { Answer, GradeResult, Json, Problem } from '../../lib/contracts';
import { recordResult, useGradeHook } from '../../lib/workspace';
import { grade } from './grade';
import { invalid, matchesParam } from './suite';
import './mutation.css';

type Param = NonNullable<Problem<'test-design'>['params']>[number];
type Row = { id: number; args: string[]; expected: string };
type MutationValue = Answer<'test-design'>['value'];
type Mode = 'table' | 'code';
const blank = (id: number, count: number): Row => ({ id, args: Array<string>(count).fill(''), expected: '' });

function parseArgument(value: string, param: Param): Json | undefined {
  if (param.type === 'number') return value.trim() ? Number(value) : undefined;
  if (param.type === 'boolean') return value === '' ? undefined : value === 'true';
  return value;
}

function readRows(rows: Row[], params: Param[]): MutationValue {
  return { rows: rows.map(({ args, expected }, index) => {
    const inputs = params.map((param, column) => {
      const input = parseArgument(args[column]!, param);
      if (input === undefined || !matchesParam(input, param)) {
        throw new Error(`Row ${index + 1}: enter a valid value for ${param.label}`);
      }
      return input;
    });
    let parsed: Json;
    try { parsed = JSON.parse(expected) as Json; }
    catch { throw new Error(`Row ${index + 1}: enter the expected result as JSON`); }
    return { args: inputs, expected: parsed };
  }) };
}

function ParamControl({ param, label, value, change }: {
  param: Param; label: string; value: string; change: (value: string) => void;
}) {
  if (param.type === 'boolean' || param.type === 'enum') {
    const options = param.type === 'boolean' ? ['true', 'false'] : param.values;
    return <select class="input" aria-label={label} value={value} onChange={(event) => change(event.currentTarget.value)}>
      <option value="">Choose…</option>
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>;
  }
  if (param.type === 'number') return <input class="input" aria-label={label} type="number" step="any" value={value}
    onInput={(event) => change(event.currentTarget.value)} />;
  return <input class="input" aria-label={label} type="text" value={value} onInput={(event) => change(event.currentTarget.value)} />;
}

function resultMisses(result: GradeResult<'test-design'> | null) {
  if (result?.status !== 'graded') return [];
  const { failedRows, referenceFailure, mutants, validOnReference } = result.details;
  if (!validOnReference) {
    if (referenceFailure !== undefined) return [`The test fails on the real function: ${referenceFailure}`];
    return failedRows.map(({ row, message }) => `Row ${row}: ${message}`);
  }
  return mutants.flatMap(({ teaches }) => teaches ? [`Not caught: ${teaches}`] : []);
}

export default function Mutation({ problem }: { problem: Problem<'test-design'> }) {
  const { params } = problem;
  const [mode, setMode] = useState<Mode>(params ? 'table' : 'code');
  const [rows, setRows] = useState<Row[]>(() => [blank(0, params?.length ?? 0)]);
  const [source, setSource] = useState(`export function test(${problem.exportName}) {\n  \n}`);
  const [editor, setEditor] = useState<typeof CodeEditor | 'unavailable'>();
  const [result, setResult] = useState<GradeResult<'test-design'> | null>(null);
  const [busy, setBusy] = useState(false);
  const nextId = useRef(1);
  const focusRow = useRef<number | 'add' | null>(null);
  const rowsPanel = useRef<HTMLDivElement>(null);
  useGradeHook(problem, grade);

  useEffect(() => {
    if (mode !== 'code' || editor) return;
    let active = true;
    void import('../../components/editor/CodeEditor').then(
      ({ default: Editor }) => { if (active) setEditor(() => Editor); },
      () => { if (active) setEditor('unavailable'); },
    );
    return () => { active = false; };
  }, [mode, editor]);

  useLayoutEffect(() => {
    if (focusRow.current === null) return;
    const point = focusRow.current === 'add' ? '[data-add-row]' : `[data-row="${focusRow.current}"] :is(input, select)`;
    rowsPanel.current?.querySelector<HTMLElement>(point)?.focus();
    focusRow.current = null;
  }, [rows]);

  function addRow() {
    const id = nextId.current++;
    focusRow.current = id;
    setRows((current) => [...current, blank(id, params?.length ?? 0)]);
  }

  function removeRow(index: number) {
    focusRow.current = (rows[index + 1] ?? rows[index - 1])?.id ?? 'add';
    setRows((current) => current.filter((_, position) => position !== index));
  }

  function updateRow(id: number, update: (row: Row) => Row) {
    setRows((current) => current.map((row) => row.id === id ? update(row) : row));
  }

  async function submit() {
    if (busy || (mode === 'code' && typeof editor !== 'function')) return;
    let value: MutationValue;
    try {
      value = mode === 'table' && params ? readRows(rows, params) : { source };
    } catch (error) {
      setResult(invalid(error instanceof Error ? error.message : 'Check the test rows'));
      return;
    }
    setBusy(true);
    try {
      const outcome = await grade(problem, { kind: 'test-design', value });
      setResult(outcome);
      recordResult(problem.id, outcome);
    } finally {
      setBusy(false);
    }
  }

  const Editor = typeof editor === 'function' ? editor : undefined;
  return <div class="mutation-workspace">
    <form noValidate onSubmit={(event) => { event.preventDefault(); void submit(); }}>
      {params && <fieldset class="mutation-modes">
        <legend>Answer format</legend>
        <label><input type="radio" name="mutation-mode" checked={mode === 'table'} onChange={() => setMode('table')} /> Table</label>
        <label><input type="radio" name="mutation-mode" checked={mode === 'code'} onChange={() => setMode('code')} /> Code</label>
      </fieldset>}
      {mode === 'table' && params ? <div class="mutation-table-card" ref={rowsPanel} data-card>
        <p id="expected-format" class="muted">Enter each expected result as JSON, such as <code>450</code>, <code>true</code>, or <code>"free"</code>.</p>
        <div class="mutation-table-scroll">
          <table aria-label="Test rows">
            <thead><tr>
              {params.map((param) => <th key={param.name} scope="col">{param.label}</th>)}
              <th scope="col">Expected result</th>
              <th scope="col">Actions</th>
            </tr></thead>
            <tbody>{rows.map((row, index) => <tr key={row.id} data-row={row.id}>
              {params.map((param, column) => <td key={param.name}><ParamControl
                param={param} label={`${param.label}, row ${index + 1}`} value={row.args[column]!}
                change={(value) => updateRow(row.id, (current) => ({
                  ...current, args: current.args.map((arg, position) => column === position ? value : arg),
                }))}
              /></td>)}
              <td><input class="input code-font" type="text" aria-label={`Expected result, row ${index + 1}`} aria-describedby="expected-format"
                value={row.expected} onInput={(event) => {
                  const expected = event.currentTarget.value;
                  updateRow(row.id, (current) => ({ ...current, expected }));
                }} /></td>
              <td><button class="button quiet" type="button" aria-label={`Remove row ${index + 1}`} onClick={() => removeRow(index)}>Remove</button></td>
            </tr>)}</tbody>
          </table>
        </div>
        <button class="button outline" type="button" data-add-row onClick={addRow}>Add row</button>
      </div> : Editor ? <>
        <p class="muted">Throw an error when an assertion fails.</p>
        <Editor label="Test function" language="js" value={source} onChange={setSource} onRun={() => void submit()} />
      </> : <p class="muted" role="status">{editor === 'unavailable' ? 'Unable to load the editor; reload the page.' : 'Loading editor…'}</p>}
      <div class="engine-actions">
        <button class="button primary" type="submit" disabled={busy || (mode === 'code' && !Editor)}>{busy ? 'Checking…' : 'Submit'}</button>
      </div>
    </form>
    <ResultPanel result={result} busy={busy} misses={resultMisses(result)} />
    {result?.status === 'graded' && result.details.validOnReference && <ul class="mutation-outcomes" aria-label="Faulty versions" data-card>
      {result.details.mutants.map(({ name, killed }) => (
        <li key={name}>
          <span>{name}</span>
          <span class={`status-chip ${killed ? 'pass' : 'fail'}`}>{killed ? 'Caught' : 'Not caught'}</span>
        </li>
      ))}
    </ul>}
  </div>;
}
