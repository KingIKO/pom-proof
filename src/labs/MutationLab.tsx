import { useState } from 'react';
import type { LabProps } from '../pages/Workspace';
import type { MutationItem } from '../content/types';
import { Editor } from '../components/Editor';
import { runMutationJob, runSuiteJob } from '../runners/client';
import type { MutationReport, SuiteRun } from '../runners/core';
import { useDraft, Verdict, ErrorBox, Running, TestList, MOD_KEY } from './shared';
import { CheckIcon } from '../components/Icons';

type Out = { mode: 'run'; run: SuiteRun } | { mode: 'submit'; report: MutationReport } | { mode: 'error'; message: string };

export default function MutationLab({ item, onResult }: LabProps<MutationItem>) {
  const [code, setCode, reset] = useDraft(`${item.id}:tests`, item.starter);
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<Out | null>(null);

  const exec = async (mode: 'run' | 'submit') => {
    setBusy(true);
    setOut(null);
    try {
      if (mode === 'run') {
        const run = await runSuiteJob({ type: 'suite', subject: item.subject, implementation: item.implementation, tests: code, ts: true });
        setOut({ mode: 'run', run });
      } else {
        const report = await runMutationJob({ type: 'mutation', subject: item.subject, implementation: item.implementation, mutants: item.mutants, tests: code, ts: true });
        setOut({ mode: 'submit', report });
        const realOk = !report.real.error && report.real.tests.length > 0 && report.real.tests.every((t) => t.passed);
        const killed = report.mutants.filter((m) => m.killed).length;
        const score = realOk ? Math.round((killed / report.mutants.length) * 100) : 0;
        onResult(realOk && killed === report.mutants.length, score);
      }
    } catch (e) {
      setOut({ mode: 'error', message: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="split-v">
      <div className="ws-toolbar">
        <span className="small muted">Tests · TypeScript</span>
        <button className="btn btn--ghost btn--sm" onClick={reset}>
          Reset
        </button>
        <span className="grow" />
        <span className="caption">
          <kbd>{MOD_KEY}</kbd> <kbd>Enter</kbd> runs
        </span>
        <button className="btn" onClick={() => exec('run')} disabled={busy}>
          Run on real code
        </button>
        <button className="btn btn--primary" onClick={() => exec('submit')} disabled={busy}>
          Submit
        </button>
      </div>
      <div className="ws-editor">
        <Editor value={code} lang="typescript" onChange={setCode} onRun={() => exec('run')} label="Your tests" />
      </div>
      <div className="ws-console">
        <div className="ws-scroll">
          {busy && <Running />}
          {!busy && !out && (
            <p className="muted small">
              Run executes your tests against the real {item.subject === 'api' ? 'API' : 'function'}. Submit also runs them against {item.mutants.length} broken versions. Each broken version should make at least one test fail.
            </p>
          )}
          {out?.mode === 'error' && <ErrorBox message={out.message} />}
          {out?.mode === 'run' && <SuiteView run={out.run} />}
          {out?.mode === 'submit' && <ReportView item={item} report={out.report} />}
        </div>
      </div>
    </div>
  );
}

function SuiteView({ run }: { run: SuiteRun }) {
  if (run.error) return <ErrorBox message={run.error} />;
  const passed = run.tests.filter((t) => t.passed).length;
  const ok = passed === run.tests.length;
  return (
    <>
      <Verdict
        ok={ok}
        title={ok ? 'All tests pass on the real code' : 'Some tests fail on the real code'}
        detail={ok ? `${passed} tests. Submit to see which bugs they catch.` : 'A test that fails on correct code is a false alarm. Fix the test, not the code.'}
      />
      <TestList tests={run.tests} />
    </>
  );
}

function ReportView({ item, report }: { item: MutationItem; report: MutationReport }) {
  if (report.real.error) return <ErrorBox message={report.real.error} />;
  const realFails = report.real.tests.filter((t) => !t.passed);
  if (realFails.length) {
    return (
      <>
        <Verdict ok={false} title="False alarm" detail="These tests fail on the correct code, so the bug report would be wrong. Fix them first." />
        <TestList tests={report.real.tests} />
      </>
    );
  }
  const killed = report.mutants.filter((m) => m.killed).length;
  const total = report.mutants.length;
  return (
    <>
      <Verdict
        ok={killed === total ? true : killed > 0 ? 'partial' : false}
        title={killed === total ? 'Every bug caught' : `${killed} of ${total} bugs caught`}
        detail={killed === total ? `${report.real.tests.length} tests, all green on the real code.` : 'Uncaught bugs stay hidden. Think about which rule in the contract they could break.'}
      />
      <div className="mutant-grid">
        {report.mutants.map((m, i) => {
          const def = item.mutants.find((x) => x.id === m.id)!;
          return (
            <div key={m.id} className={`mutant ${m.killed ? 'mutant--killed' : 'mutant--alive'}`}>
              <div className="mutant-head">
                <span>Bug {i + 1}</span>
                {m.killed ? (
                  <span className="pass">
                    <CheckIcon /> caught
                  </span>
                ) : (
                  <span className="muted">not caught</span>
                )}
              </div>
              <div className="small" style={{ marginTop: 4, color: m.killed ? 'var(--label-1)' : 'var(--label-3)' }}>
                {m.killed ? def.label : 'Hidden until a test catches it.'}
              </div>
              {m.killed && m.by.length > 0 && <div className="caption" style={{ marginTop: 4 }}>Caught by: {m.by.slice(0, 2).join(', ')}{m.by.length > 2 ? ` and ${m.by.length - 2} more` : ''}</div>}
            </div>
          );
        })}
      </div>
      <h3 className="h3" style={{ margin: '16px 0 8px' }}>
        Your tests on the real code
      </h3>
      <TestList tests={report.real.tests} />
    </>
  );
}
