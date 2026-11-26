import { useCallback, useEffect, useRef, useState } from 'react';
import type { LabProps } from '../pages/Workspace';
import type { LocatorItem } from '../content/types';
import { Editor } from '../components/Editor';
import { detectStrategy, resolveExpression, reviewLocator, type Smell, type Strategy } from '../runners/locators';
import { useDraft, Verdict } from './shared';

const FRAME_STYLE = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; color: #111; margin: 16px; line-height: 1.45; }
  [data-pp-match] { outline: 2px solid rgb(65,118,230) !important; outline-offset: 2px; background-color: rgba(65,118,230,0.08) !important; }
  [data-pp-target] { outline: 2px dashed rgb(22,163,74) !important; outline-offset: 2px; }
  button { font: inherit; }
`;

const STRATEGY_LABEL: Record<Strategy, string> = { css: 'CSS', xpath: 'XPath', playwright: 'Playwright' };

export function buildSrcdoc(html: string, extraCss = '') {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FRAME_STYLE}${extraCss}</style></head><body>${html}</body></html>`;
}

type Check = { passed: boolean; count: number; extra: number; missing: number; smells: Smell[] } | { error: string };

export default function LocatorLab({ item, onResult }: LabProps<LocatorItem>) {
  const [expr, setExpr] = useDraft(`${item.id}:locator`, '');
  const [live, setLive] = useState<{ count: number; error?: string } | null>(null);
  const [check, setCheck] = useState<Check | null>(null);
  const [view, setView] = useState<'page' | 'html'>('page');
  const [showTarget, setShowTarget] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);
  const strategy = detectStrategy(expr || 'x');

  const doc = () => frame.current?.contentDocument ?? null;

  const highlight = useCallback(
    (els: Element[]) => {
      const d = doc();
      if (!d) return;
      d.querySelectorAll('[data-pp-match]').forEach((e) => e.removeAttribute('data-pp-match'));
      els.forEach((e) => e.setAttribute('data-pp-match', ''));
      els[0]?.scrollIntoView({ block: 'nearest' });
    },
    [],
  );

  const evaluate = useCallback(() => {
    const d = doc();
    if (!d || !d.body) return;
    if (!expr.trim()) {
      highlight([]);
      setLive(null);
      return;
    }
    try {
      const strat = detectStrategy(expr);
      if (!item.allow.includes(strat)) {
        highlight([]);
        setLive({ count: 0, error: `${STRATEGY_LABEL[strat]} is not allowed here. Use ${item.allow.map((a) => STRATEGY_LABEL[a]).join(' or ')}.` });
        return;
      }
      const els = resolveExpression(d, expr, strat);
      highlight(els);
      setLive({ count: els.length });
    } catch (e) {
      highlight([]);
      setLive({ count: 0, error: e instanceof Error ? e.message : String(e) });
    }
  }, [expr, item.allow, highlight]);

  useEffect(() => {
    const t = window.setTimeout(evaluate, 200);
    return () => window.clearTimeout(t);
  }, [evaluate]);

  useEffect(() => {
    const d = doc();
    if (!d) return;
    d.querySelectorAll('[data-pp-target]').forEach((e) => e.removeAttribute('data-pp-target'));
    if (showTarget) d.querySelectorAll(item.target).forEach((e) => e.setAttribute('data-pp-target', ''));
  }, [showTarget, item.target]);

  const submit = () => {
    const d = doc();
    if (!d) return;
    try {
      const strat = detectStrategy(expr);
      if (!item.allow.includes(strat)) throw new Error(`${STRATEGY_LABEL[strat]} is not allowed here.`);
      const got = resolveExpression(d, expr, strat);
      const want = Array.from(d.querySelectorAll(item.target));
      const extra = got.filter((e) => !want.includes(e)).length;
      const missing = want.filter((e) => !got.includes(e)).length;
      const passed = extra === 0 && missing === 0;
      const smells = passed ? reviewLocator(expr, strat) : [];
      setCheck({ passed, count: got.length, extra, missing, smells });
      onResult(passed, passed ? (smells.length ? 70 : 100) : 0);
    } catch (e) {
      setCheck({ error: e instanceof Error ? e.message : String(e) });
    }
  };

  return (
    <div className="split-v">
      <div className="locator-bar">
        <span className="tag" title="Detected from what you type">
          {expr.trim() ? STRATEGY_LABEL[strategy] : item.allow.map((a) => STRATEGY_LABEL[a]).join(' / ')}
        </span>
        <input
          className="input"
          value={expr}
          onChange={(e) => {
            setExpr(e.target.value);
            setCheck(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={item.allow.includes('playwright') ? `page.getByRole('button', { name: 'Save' })` : item.allow.includes('css') ? 'button[type="submit"]' : "//button[text()='Save']"}
          aria-label="Locator"
          spellCheck={false}
          autoComplete="off"
        />
        <button className="btn btn--primary" onClick={submit} disabled={!expr.trim()}>
          Check
        </button>
      </div>
      <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-2)', minHeight: 40 }} aria-live="polite">
        {check && 'error' in check && <span className="small fail">{check.error}</span>}
        {check && !('error' in check) && (
          <>
            <Verdict
              ok={check.passed ? (check.smells.length ? 'partial' : true) : false}
              title={check.passed ? (check.smells.length ? 'Correct, but brittle' : 'Correct') : 'Not quite'}
              detail={
                check.passed
                  ? check.smells.length
                    ? 'It matches today. Here is what would break it:'
                    : 'Matches exactly the right elements, without leaning on layout.'
                  : [check.missing ? `${check.missing} target element${check.missing > 1 ? 's' : ''} not matched` : '', check.extra ? `${check.extra} extra element${check.extra > 1 ? 's' : ''} matched` : '']
                      .filter(Boolean)
                      .join(', ')
              }
            />
            {check.smells.length > 0 && (
              <ul className="small" style={{ margin: '0 0 4px', paddingLeft: 18 }}>
                {check.smells.map((s, i) => (
                  <li key={i}>
                    <strong>{s.rule}.</strong> {s.detail}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
        {!check && live && <span className={`small ${live.error ? 'fail' : 'muted'} num`}>{live.error ?? `${live.count} element${live.count === 1 ? '' : 's'} matched`}</span>}
        {!check && !live && <span className="small muted">Matches highlight as you type. Press Enter or Check to grade.</span>}
      </div>
      <div className="frame-wrap">
        <div className="frame-label">
          <div className="segmented" role="group" aria-label="View">
            <button aria-pressed={view === 'page'} onClick={() => setView('page')}>
              Page
            </button>
            <button aria-pressed={view === 'html'} onClick={() => setView('html')}>
              HTML
            </button>
          </div>
          <label className="check small">
            <input type="checkbox" checked={showTarget} onChange={(e) => setShowTarget(e.target.checked)} /> Outline the target
          </label>
        </div>
        <iframe
          ref={frame}
          className="sandbox-frame"
          title="Practice page"
          sandbox="allow-same-origin"
          srcDoc={buildSrcdoc(item.html)}
          onLoad={evaluate}
          style={view === 'page' ? undefined : { display: 'none' }}
        />
        {view === 'html' && (
          <div className="editor" style={{ background: 'var(--bg-layer)' }}>
            <Editor value={item.html.trim()} lang="html" readOnly label="Page HTML" />
          </div>
        )}
      </div>
    </div>
  );
}
