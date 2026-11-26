import { useState } from 'react';
import type { LabProps } from '../pages/Workspace';
import type { CodingItem, Lang } from '../content/types';
import { Editor } from '../components/Editor';
import { runCoding, runPython, pyName } from '../runners/client';
import type { CaseResult } from '../runners/core';
import { setPref, useStore } from '../lib/store';
import { useDraft, Verdict, ErrorBox, Running, MOD_KEY } from './shared';

function defaultStarter(item: CodingItem, lang: Lang): string {
  if (item.starter?.[lang]) return item.starter[lang]!;
  const names = item.params.map((p) => p.name);
  if (lang === 'python') return `def ${pyName(item.fn)}(${names.join(', ')}):\n    # Write your solution here\n    pass\n`;
  if (lang === 'typescript') {
    const sig = item.params.map((p) => `${p.name}: ${p.type}`).join(', ');
    return `function ${item.fn}(${sig}): ${item.returns} {\n  // Write your solution here\n}\n`;
  }
  return `function ${item.fn}(${names.join(', ')}) {\n  // Write your solution here\n}\n`;
}

type Outcome = { mode: 'run' | 'submit'; results: CaseResult[]; compileError?: string; error?: string };

export default function CodingLab({ item, onResult }: LabProps<CodingItem>) {
  const lang = useStore((s) => s.prefs.lang);
  const [code, setCode, reset] = useDraft(`${item.id}:${lang}`, defaultStarter(item, lang));
  const [busy, setBusy] = useState<false | string>(false);
  const [out, setOut] = useState<Outcome | null>(null);
  const [sel, setSel] = useState(0);

  const exec = async (mode: 'run' | 'submit') => {
    const cases = mode === 'run' ? item.cases.filter((c) => !c.hidden) : item.cases;
    setBusy(mode === 'run' ? 'Running' : 'Submitting');
    setOut(null);
    try {
      const r =
        lang === 'python'
          ? await runPython(code, pyName(item.fn), cases, item.compare, () => setBusy('Loading Python (about 6 MB, first run only)'))
          : await runCoding({ type: 'coding', code, ts: lang === 'typescript', fn: item.fn, cases, compare: item.compare });
      setOut({ mode, ...r });
      const firstFail = r.results.findIndex((x) => !x.passed);
      setSel(firstFail === -1 ? 0 : firstFail);
      if (mode === 'submit') {
        const passed = r.results.filter((x) => x.passed).length;
        const all = !r.compileError && passed === cases.length;
        onResult(all, r.compileError ? 0 : Math.round((passed / cases.length) * 100));
      }
    } catch (e) {
      setOut({ mode, results: [], error: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  const results = out?.results ?? [];
  const passed = results.filter((r) => r.passed).length;
  const cur = results[sel];

  return (
    <div className="split-v">
      <div className="ws-toolbar">
        <select className="select" value={lang} onChange={(e) => setPref('lang', e.target.value as Lang)} aria-label="Language">
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
        </select>
        <button className="btn btn--ghost btn--sm" onClick={reset} title="Replace your code with the starter">
          Reset
        </button>
        <span className="grow" />
        <span className="caption">
          <kbd>{MOD_KEY}</kbd> <kbd>Enter</kbd> runs
        </span>
        <button className="btn" onClick={() => exec('run')} disabled={!!busy}>
          Run
        </button>
        <button className="btn btn--primary" onClick={() => exec('submit')} disabled={!!busy}>
          Submit
        </button>
      </div>
      <div className="ws-editor">
        <Editor value={code} lang={lang} onChange={setCode} onRun={() => exec('run')} label="Solution code" />
      </div>
      <div className="ws-console">
        <div className="ws-scroll">
          {busy && <Running label={busy} />}
          {!busy && !out && <p className="muted small">Run checks the visible cases. Submit adds the hidden ones and records your result.</p>}
          {out?.error && <ErrorBox message={out.error} />}
          {out?.compileError && <ErrorBox message={out.compileError} />}
          {out && !out.error && !out.compileError && results.length > 0 && (
            <>
              <Verdict
                ok={passed === results.length}
                title={passed === results.length ? (out.mode === 'submit' ? 'Accepted' : 'All visible cases pass') : 'Wrong answer'}
                detail={`${passed} of ${results.length} ${out.mode === 'submit' ? 'cases, including hidden' : 'visible cases'}`}
              />
              <div className="case-tabs" role="tablist">
                {results.map((r, i) => (
                  <button key={i} className="case-tab" role="tab" aria-selected={sel === i} onClick={() => setSel(i)}>
                    <span className={`dot ${r.passed ? 'pass' : 'fail'}`} />
                    {r.hidden ? `Hidden ${i + 1}` : `Case ${i + 1}`}
                  </button>
                ))}
              </div>
              {cur && (
                <div className="kv">
                  {cur.hidden && cur.passed ? (
                    <p className="small muted">Hidden case passed.</p>
                  ) : (
                    <>
                      <div>
                        <div className="kv-label">Input</div>
                        <div className="kv-value">{item.params.map((p, j) => `${p.name} = ${cur.args[j] ?? ''}`).join('\n')}</div>
                      </div>
                      <div>
                        <div className="kv-label">Expected</div>
                        <div className="kv-value">{cur.expected}</div>
                      </div>
                      <div>
                        <div className="kv-label">Your output</div>
                        <div className="kv-value">{cur.error ? cur.error : cur.actual}</div>
                      </div>
                    </>
                  )}
                  {cur.logs.length > 0 && (
                    <div>
                      <div className="kv-label">Console</div>
                      <div className="kv-value">{cur.logs.join('\n')}</div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
