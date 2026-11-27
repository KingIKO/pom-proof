import { useEffect, useRef, useState } from 'preact/hooks';
import CodeEditor from '../../components/editor/CodeEditor';
import ResultPanel from '../../components/shell/ResultPanel';
import type { GradeResult, Problem } from '../../lib/contracts';
import { recordResult, useGradeHook } from '../../lib/workspace';
import { sqlRunner } from '../../runners/sql-browser';
import type { SchemaTable, SqlTable } from '../../runners/sql';
import { checkSql, createSqlGrader, hiddenDatasetMiss } from './grade';
import './workspace.css';

const grade = createSqlGrader(sqlRunner);
const errorMessage = (error: unknown) => error instanceof Error ? error.message : String(error);

function ResultTable({ table }: { table: SqlTable }) {
  return (
    <div class="sql-table" role="region" aria-label="Visible result rows" tabIndex={0} data-card>
      <table>
        <caption>{table.values.length} {table.values.length === 1 ? 'row' : 'rows'}</caption>
        <thead>
          <tr>{table.columns.map((column, index) => <th key={index} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody>
          {table.values.map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, index) => (
              <td key={index}><code>{cell === null ? 'NULL' : cell instanceof Uint8Array
                ? `X'${Array.from(cell, (byte) => byte.toString(16).padStart(2, '0')).join('')}'`
                : cell}</code></td>
            ))}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Sql({ problem }: { problem: Problem<'sql'> }) {
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [result, setResult] = useState<GradeResult<'sql'> | null>(null);
  const [table, setTable] = useState<SqlTable>();
  const [hiddenError, setHiddenError] = useState<string>();
  const [schema, setSchema] = useState<SchemaTable[]>();
  const [schemaError, setSchemaError] = useState<string>();
  useGradeHook<'sql'>(problem, grade);

  useEffect(() => {
    let active = true;
    void sqlRunner.schema(problem.schema).then(
      (tables) => { if (active) setSchema(tables); },
      (error) => { if (active) setSchemaError(errorMessage(error)); },
    );
    return () => { active = false; };
  }, [problem.schema]);

  async function execute(mode: 'run' | 'submit') {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setResult(null);
    setTable(undefined);
    setHiddenError(undefined);
    try {
      if (mode === 'run') {
        setTable(await sqlRunner.query(problem.schema, problem.seed, query));
      } else {
        const report = await checkSql(problem, { kind: 'sql', value: { query } }, sqlRunner);
        setResult(report.result);
        setTable(report.table);
        setHiddenError(report.hiddenError);
        recordResult(problem.id, report.result);
      }
    } catch (error) {
      setResult({ kind: 'sql', status: 'invalid-answer', message: errorMessage(error) });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const datasets = result?.status === 'graded' ? result.details.datasets : undefined;
  const misses = datasets?.[0]?.passed && !datasets[1]?.passed ? [hiddenDatasetMiss] : undefined;

  return (
    <div data-engine="sql">
      <div class="sql-schema-card" data-card>
        <h3>Schema</h3>
        {schema && (
          <dl class="sql-schema">
            {schema.map(({ name, columns }) => (
              <div key={name}>
                <dt><strong><code>{name}</code></strong></dt>
                <dd>{columns.map(({ name: column, type }, index) => (
                  <span key={column}>{index > 0 && ', '}<code>{column}{type && ` ${type}`}</code></span>
                ))}</dd>
              </div>
            ))}
          </dl>
        )}
        {!schema && <p class="muted">{schemaError ?? 'Loading schema…'}</p>}
      </div>
      <p class="engine-hint">Run queries on the visible data. Submit checks both datasets.</p>
      <CodeEditor value={query} language="sql" label="SQL query" onChange={setQuery}
        onRun={() => void execute('run')} resetTo="" busy={busy}
        toolbar={<span class="editor-language">Language: SQLite</span>} />
      <div class="engine-actions">
        <button class="button outline" type="button" onClick={() => void execute('run')} disabled={busy}>Run</button>
        <button class="button primary" type="button" onClick={() => void execute('submit')} disabled={busy}>Submit</button>
      </div>
      {busy && <p class="muted" role="status">Running…</p>}
      <ResultPanel result={result} misses={misses} />
      {datasets && (
        <ul class="sql-datasets" data-card>
          {datasets.map(({ name, passed }) => (
            <li key={name} data-status={passed ? 'pass' : 'fail'}>
              <span>{name === 'seed' ? 'Visible dataset' : 'Hidden dataset'}</span>
              <span class={`status-chip ${passed ? 'pass' : 'fail'}`}>{passed ? 'Pass' : 'Fail'}</span>
            </li>
          ))}
          {hiddenError && <li>{hiddenError}</li>}
        </ul>
      )}
      {table && (
        <div class="sql-output">
          <h3>Visible result</h3>
          <ResultTable table={table} />
        </div>
      )}
    </div>
  );
}
