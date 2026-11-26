import { useRef, useState } from 'react';
import type { UiLabItem } from '../content/types';
import type { LabProps } from '../pages/Workspace';
import { Editor } from '../components/Editor';
import {
  buildUiSrcdoc, loadUiFrame, runUiMutation, runUiSuite, uiSuitePassed, UI_APP_SANDBOX,
  type UiMutationReport, type UiSuiteRun,
} from '../runners/uilab';
import { ErrorBox, Running, TestList, Verdict, useDraft } from './shared';
import './uilab.css';

type Output = { run: UiSuiteRun; report?: UiMutationReport };

export default function UiLab({ item, onResult }: LabProps<UiLabItem>) {
  const [code, setCode, reset] = useDraft(`${item.id}:tests`, item.starter);
  const [busy, setBusy] = useState<'run' | 'submit' | null>(null);
  const [output, setOutput] = useState<Output | null>(null);
  const [preview, setPreview] = useState(0);
  const running = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  async function exec(mode: 'run' | 'submit') {
    if (running.current) return;
    running.current = true;
    setBusy(mode);
    setOutput(null);
    if (resultsRef.current) resultsRef.current.scrollTop = 0;
    try {
      if (mode === 'run') {
        setOutput({ run: await runUiSuite(item, code, loadUiFrame) });
      } else {
        const report = await runUiMutation(item, code, loadUiFrame);
        const caught = report.mutants.filter((mutant) => mutant.killed).length;
        const total = item.mutants.length;
        const clean = uiSuitePassed(report.real);
        onResult(clean && caught === total, clean && total > 0 ? Math.round(100 * caught / total) : 0);
        setOutput({ run: report.real, report });
      }
    } finally {
      running.current = false;
      setBusy(null);
    }
  }

  return (
    <div className="split-v ui-lab">
      <div className="ws-toolbar ui-lab-toolbar">
        <span className="small muted">Tests · TypeScript</span>
        <button type="button" className="btn btn--ghost btn--sm" disabled={!!busy} onClick={() => { reset(); setOutput(null); }}>Reset tests</button>
        <span className="grow" />
        <button type="button" className="btn" disabled={!!busy} onClick={() => void exec('run')}>Run on working app</button>
        <button type="button" className="btn btn--primary" disabled={!!busy} onClick={() => void exec('submit')}>Submit</button>
      </div>
      <div className="ws-editor ui-lab-editor">
        <Editor value={code} lang="typescript" label="Your tests" onChange={setCode} onRun={() => void exec('run')} />
      </div>
      <section className="frame-wrap ui-lab-preview" aria-label="Working app">
        <div className="frame-label">
          <h2 className="h3">Working app</h2>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setPreview((version) => version + 1)}>Reset app</button>
        </div>
        <iframe key={preview} className="sandbox-frame" title="Working app" sandbox={UI_APP_SANDBOX} srcDoc={buildUiSrcdoc(item)} />
      </section>
      <div className="ws-console ui-lab-results">
        <div ref={resultsRef} className="ws-scroll" aria-label="Test results" tabIndex={0}>
          {busy && <div role="status"><Running label={busy === 'submit' ? 'Checking tests against app variants' : 'Running on the working app'} /></div>}
          {!busy && !output && (
            <p className="muted small">Try the app, then run your tests. Submit checks them against {item.mutants.length} buggy versions. Each test starts with a fresh app.</p>
          )}
          {output && <Results item={item} output={output} />}
        </div>
      </div>
    </div>
  );
}

function Results({ item, output: { run, report } }: { item: UiLabItem; output: Output }) {
  if (run.error) return <ErrorBox message={run.error} />;
  if (!uiSuitePassed(run)) {
    return (
      <>
        <Verdict ok={false} title="Tests fail on the working app" detail="Fix these failures before checking buggy versions." />
        <TestList tests={run.tests} />
      </>
    );
  }
  if (!report) {
    return (
      <>
        <Verdict ok title="All tests pass on the working app" detail="Submit to check which bugs they catch." />
        <TestList tests={run.tests} />
      </>
    );
  }
  const caught = report.mutants.filter((m) => m.killed).length;
  const total = item.mutants.length;
  return (
    <>
      <Verdict ok={caught === total || (caught ? 'partial' : false)} title={caught === total ? 'Every bug caught' : `${caught} of ${total} bugs caught`} />
      {report.mutants.some(({ run: variant }) => variant.error) && (
        <ErrorBox message="A test fixture could not run. Submit again to retry." />
      )}
      <div className="mutant-grid">
        {report.mutants.map((mutant, i) => (
          <div key={mutant.id} className={`mutant ${mutant.killed ? 'mutant--killed' : 'mutant--alive'}`}>
            <div className="mutant-head">
              <span>Bug {i + 1}</span>
              <span className={mutant.killed ? 'pass' : 'muted'}>{mutant.killed ? 'Caught' : mutant.run.error ? 'Not checked' : 'Not caught'}</span>
            </div>
            <div className="small">{mutant.killed ? item.mutants.find(({ id }) => id === mutant.id)?.label : 'Hidden until a test catches it.'}</div>
            {mutant.killed && <div className="caption">Caught by: {mutant.by.join(', ')}</div>}
          </div>
        ))}
      </div>
      <h3 className="h3 ui-lab-results-title">Tests on the working app</h3>
      <TestList tests={run.tests} />
    </>
  );
}
