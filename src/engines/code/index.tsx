import { useRef, useState } from 'preact/hooks';
import CodeEditor from '../../components/editor/CodeEditor';
import ResultPanel from '../../components/shell/ResultPanel';
import type { Answer, Problem } from '../../lib/contracts';
import { recordResult, useGradeHook } from '../../lib/workspace';
import { runCode } from '../../runners/code-browser';
import { runPython } from '../../runners/python-browser';
import { pythonName } from '../../runners/python-contract';
import { checkCode, createCodeGrader } from './grade';
import './workspace.css';

const grade = createCodeGrader(runCode);
type Mode = 'run' | 'submit';
type Language = Answer<'code'>['value']['language'];

export default function Code({ problem }: { problem: Problem<'code'> }) {
  const [language, setLanguage] = useState<Language>('js');
  const [drafts, setDrafts] = useState(problem.starters);
  const [busy, setBusy] = useState(false);
  const [loadingPython, setLoadingPython] = useState(false);
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
      const checked = await checkCode(problem, { kind: 'code', value: { language, source } }, runCode, mode,
        (request) => runPython(request, setLoadingPython));
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
      <p>
        {language === 'python' ? <>Define <code>{pythonName(problem.exportName)}</code>.</>
          : <>Export <code>{problem.exportName}</code>.</>}
        {' '}Run checks the visible inputs. Submit checks every input.
      </p>
      <p>
        <label>
          Language{' '}
          <select disabled={busy} value={language} onChange={(event) => {
            const next = event.currentTarget.value;
            if (next === 'js' || next === 'ts' || next === 'python') {
              setLanguage(next);
              setReport(null);
            }
          }}>
            <option value="js">JavaScript</option>
            <option value="ts">TypeScript</option>
            <option value="python">Python</option>
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
      {busy && <p class="muted" role="status">
        {loadingPython ? 'Loading Python, about 6 MB, first run only' : 'Running…'}
      </p>}
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
                  {check.error !== undefined ? <span class="code-error">{check.error}</span> : <code>{JSON.stringify(check.actual)}</code>}
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
