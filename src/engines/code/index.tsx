import { useRef, useState } from 'preact/hooks';
import CodeEditor from '../../components/editor/CodeEditor';
import ResultPanel from '../../components/shell/ResultPanel';
import type { Problem } from '../../lib/contracts';
import { recordResult, useGradeHook } from '../../lib/workspace';
import { runCode } from '../../runners/code-browser';
import type { CodeLanguage } from '../../runners/code-evaluate';
import { checkCode, createCodeGrader } from './grade';
import './workspace.css';

const grade = createCodeGrader(runCode);
type Mode = 'run' | 'submit';

export default function Code({ problem }: { problem: Problem<'code'> }) {
  const [language, setLanguage] = useState<CodeLanguage>('js');
  const [drafts, setDrafts] = useState({ js: problem.starters.js, ts: problem.starters.ts });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [report, setReport] = useState<(Awaited<ReturnType<typeof checkCode>> & { mode: Mode }) | null>(null);
  const source = drafts[language];
  useGradeHook<'code'>(problem, grade);

  async function execute(mode: Mode) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setReport(null);
    try {
      const checked = await checkCode(problem, { kind: 'code', value: { language, source } }, runCode, mode);
      setReport({ ...checked, mode });
      if (mode === 'submit') recordResult(problem.id, checked.result);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  const result = report?.result ?? null;
  const checks = report?.checks;
  const vectors = result?.status === 'graded' ? result.details.vectors : [];

  return (
    <div data-engine="code">
      <p>Export <code>{problem.exportName}</code>. Run checks the visible inputs. Submit checks every input.</p>
      <p>
        <label>
          Language{' '}
          <select disabled={busy} value={language} onChange={(event) => {
            const next = event.currentTarget.value;
            if (next === 'js' || next === 'ts') {
              setLanguage(next);
              setReport(null);
            }
          }}>
            <option value="js">JavaScript</option>
            <option value="ts">TypeScript</option>
            <option value="python" disabled>Python arrives soon</option>
          </select>
        </label>
      </p>
      <CodeEditor key={language} value={source} language={language} label="Solution code"
        onChange={(value) => setDrafts((previous) => ({ ...previous, [language]: value }))}
        onRun={() => void execute('run')} />
      <div class="engine-actions">
        <button type="button" onClick={() => void execute('run')} disabled={busy}>Run</button>
        <button class="primary" type="button" onClick={() => void execute('submit')} disabled={busy}>Submit</button>
      </div>
      {busy && <p class="muted" role="status">Running…</p>}
      {report?.mode === 'run' && result?.status === 'graded'
        ? <p role="status" class="result" data-status={result.score === 1 ? 'pass' : 'fail'}>
          {vectors.filter(({ passed }) => passed).length} of {vectors.length} visible checks passed
        </p>
        : <ResultPanel result={result} />}
      {checks && <ol class="code-checks">
        {checks.map((check, index) => (
          <li key={vectors[index].name}>
            <p class="check-mark" data-status={check.passed ? 'pass' : 'fail'}>
              <strong>{vectors[index].name} {check.passed ? 'passed' : 'failed'}</strong>
            </p>
            {check.visible && (
              <dl>
                <dt>Input</dt><dd><code>{JSON.stringify(problem.vectors[index].args)}</code></dd>
                <dt>Expected</dt><dd><code>{JSON.stringify(problem.vectors[index].expected)}</code></dd>
                <dt>Actual</dt><dd>
                  {check.error !== undefined ? <span>{check.error}</span> : <code>{JSON.stringify(check.actual)}</code>}
                </dd>
                <dt>Logs</dt><dd>{check.logs.length ? <pre>{check.logs.join('\n')}</pre> : 'None'}</dd>
              </dl>
            )}
          </li>
        ))}
      </ol>}
    </div>
  );
}
