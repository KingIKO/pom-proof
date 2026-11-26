import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { TestResult } from '../runners/expect';
import { CheckIcon, CrossIcon } from '../components/Icons';
import { saveDraft, getState, clearDraft } from '../lib/store';

/** Editor contents saved per item and language, restored on return. */
export function useDraft(key: string, initial: string): [string, (v: string) => void, () => void] {
  const [value, setValue] = useState(() => getState().drafts[key] ?? initial);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => {
    setValue(getState().drafts[key] ?? initial);
    // Only reload when the key changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const set = (v: string) => {
    setValue(v);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => saveDraft(key, v), 400);
  };
  const reset = () => {
    window.clearTimeout(timer.current);
    clearDraft(key);
    setValue(initial);
  };
  return [value, set, reset];
}

export function Verdict({ ok, title, detail }: { ok: boolean | 'partial'; title: string; detail?: ReactNode }) {
  const cls = ok === true ? 'pass' : ok === 'partial' ? 'warn' : 'fail';
  return (
    <div className="result-head" role="status">
      <span className={`result-title ${cls}`}>{title}</span>
      {detail && <span className="small muted">{detail}</span>}
    </div>
  );
}

export function TestList({ tests }: { tests: TestResult[] }) {
  return (
    <ul className="test-list">
      {tests.map((t, i) => (
        <li key={i}>
          <span className={t.passed ? 'pass' : 'fail'}>{t.passed ? <CheckIcon /> : <CrossIcon />}</span>
          <span>{t.name}</span>
          <span className="caption num">{t.ms} ms</span>
          {t.error && <span className="err">{t.error}</span>}
        </li>
      ))}
    </ul>
  );
}

export function Running({ label = 'Running' }: { label?: string }) {
  return <p className="muted small">{label}…</p>;
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="notice notice--bad" role="alert">
      <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'var(--font-code)', fontSize: 12.5 }}>{message}</pre>
    </div>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd>{children}</kbd>;
}

export const MOD_KEY = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';

export function Timer({ seconds, onDone, running = true }: { seconds: number; onDone?: () => void; running?: boolean }) {
  const [left, setLeft] = useState(seconds);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => setLeft(seconds), [seconds]);
  useEffect(() => {
    if (!running) return;
    const t = window.setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          window.clearInterval(t);
          done.current?.();
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [running]);
  const m = Math.floor(left / 60);
  const s = left % 60;
  return (
    <span className={left < 30 ? 'timer timer--low' : 'timer'} aria-label={`${m} minutes ${s} seconds left`}>
      {m}:{String(s).padStart(2, '0')}
    </span>
  );
}
