import { Fragment, useRef, useState } from 'react';
import { REVIEW_CATEGORIES, type ReviewIssue, type ReviewItem } from '../content/types';
import type { LabProps } from '../pages/Workspace';
import { Verdict } from './shared';
import './forms.css';

type Category = (typeof REVIEW_CATEGORIES)[number];
type Flag = { category: Category; note: string };
type FlagDraft = { line: number; category: Category | ''; note: string };
type Flags = Partial<Record<number, Flag>>;

const includesLine = ({ lines: [start, end] }: ReviewIssue, line: number) => line >= start && line <= end;
const lineLabel = ([start, end]: ReviewIssue['lines']) => start === end ? `Line ${start}` : `Lines ${start} to ${end}`;

function grade(issues: ReviewIssue[], flags: Flags) {
  const entries = Object.entries(flags);
  const issueCredit = issues.map((issue) => {
    const matching = entries.filter(([line]) => includesLine(issue, Number(line)));
    if (matching.some(([, flag]) => flag?.category === issue.category)) return 1;
    return matching.length ? 0.5 : 0;
  });
  const falseFlags = entries.filter(([line]) => !issues.some((issue) => includesLine(issue, Number(line)))).map(([line]) => Number(line));
  const credit = issueCredit.reduce<number>((total, value) => total + value, 0);
  const score = Math.max(0, Math.round(100 * credit / issues.length - 10 * falseFlags.length));
  const solved = issueCredit.every((value) => value === 1) && falseFlags.length <= 1;
  return { issueCredit, falseFlags, score, solved };
}

export default function ReviewLab({ item, onResult }: LabProps<ReviewItem>) {
  const [flags, setFlags] = useState<Flags>({});
  const [draft, setDraft] = useState<FlagDraft | null>(null);
  const [report, setReport] = useState<ReturnType<typeof grade> | null>(null);
  const lineButton = useRef<HTMLButtonElement | null>(null);
  // Lines are 1-based after removing one leading line break. Internal blank lines count.
  const lines = item.code.replace(/^\r?\n/, '').split(/\r?\n/);

  function closeFlag() {
    setDraft(null);
    lineButton.current?.focus();
  }

  function submit() {
    const result = grade(item.issues, flags);
    setReport(result);
    onResult(result.solved, result.score);
  }

  return (
    <div className="split-v">
      <div className="ws-scroll forms-lab">
        <header className="forms-stack">
          <h2 className="h3" id="review-code">Test code <span className="caption">· {item.lang}</span></h2>
          <p className="small muted">Choose a line number to flag an issue. Line 1 starts after the opening blank line; blank lines inside the code count.</p>
        </header>
        <div className="code-view forms-code" role="region" tabIndex={0} aria-labelledby="review-code">
          {lines.map((text, i) => {
            const line = i + 1;
            const flag = flags[line];
            const open = draft?.line === line;
            let state = '';
            if (flag) {
              state = 'flag';
              if (report?.falseFlags.includes(line)) state = 'miss';
              else if (report && item.issues.some((issue) => includesLine(issue, line) && issue.category === flag.category)) state = 'hit';
            }
            return (
              <Fragment key={line}>
                <div className={`code-line${state ? ` code-line--${state}` : ''}`}>
                  {report ? <span className="ln">{line}</span> : (
                    <button
                      type="button"
                      className="ln forms-line-number"
                      aria-label={flag ? `Edit flag on line ${line}: ${flag.category}` : `Flag line ${line}`}
                      aria-expanded={open}
                      aria-controls={open ? 'review-flag-form' : undefined}
                      onClick={(e) => {
                        if (open) { closeFlag(); return; }
                        lineButton.current = e.currentTarget;
                        setDraft({ line, category: flag?.category ?? '', note: flag?.note ?? '' });
                      }}
                    >{line}</button>
                  )}
                  <code className="forms-source-line">{text || ' '}</code>
                </div>
                {open && (
                  <form id="review-flag-form" className="forms-inline-flag forms-stack" aria-label={`Flag line ${line}`} onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.category) return;
                    setFlags({ ...flags, [line]: { category: draft.category, note: draft.note } });
                    closeFlag();
                  }}>
                    <label className="field">
                      <span>Category</span>
                      <select className="select" value={draft.category} onChange={(e) => {
                        const category = REVIEW_CATEGORIES.find((option) => option === e.currentTarget.value);
                        setDraft({ ...draft, category: category ?? '' });
                      }}>
                        <option value="" disabled>Choose a category</option>
                        {REVIEW_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
                      </select>
                    </label>
                    <label className="field">
                      <span>Note (optional)</span>
                      <input className="input" value={draft.note} onChange={(e) => setDraft({ ...draft, note: e.currentTarget.value })} />
                    </label>
                    <div className="btn-row">
                      <button type="submit" className="btn btn--primary btn--sm" disabled={!draft.category}>Save flag</button>
                      <button type="button" className="btn btn--ghost btn--sm" onClick={closeFlag}>Cancel</button>
                      {flag && <button type="button" className="btn btn--ghost btn--sm" onClick={() => {
                        const next = { ...flags };
                        delete next[line];
                        setFlags(next);
                        closeFlag();
                      }}>Remove flag</button>}
                    </div>
                  </form>
                )}
              </Fragment>
            );
          })}
        </div>
        {report ? (
          <section className="forms-stack" aria-label="Review results">
            <Verdict ok={report.solved || 'partial'} title={report.solved ? 'Review complete' : 'Review the issue key'} detail={`${report.score}% · ${report.falseFlags.length} false ${report.falseFlags.length === 1 ? 'flag' : 'flags'}`} />
            {report.falseFlags.length > 0 && <p className="caption">False flags on {report.falseFlags.length === 1 ? 'line' : 'lines'} {report.falseFlags.join(', ')}. Each costs 10 points.</p>}
            <ol className="forms-result-list forms-stack">
              {item.issues.map((issue, i) => {
                const credit = report.issueCredit[i];
                return (
                  <li key={issue.id}>
                    <p><strong>{issue.title}</strong> <span className={credit === 1 ? 'pass' : credit ? 'warn' : 'fail'}>· {credit === 1 ? 'Found' : credit ? 'Half credit' : 'Missed'}</span></p>
                    <p className="caption">{lineLabel(issue.lines)} · {issue.category}</p>
                    <p className="small">{issue.explanation}</p>
                  </li>
                );
              })}
            </ol>
            <div><button type="button" className="btn" onClick={() => setReport(null)}>Revise review</button></div>
          </section>
        ) : (
          <div className="btn-row">
            <button type="button" className="btn btn--primary" onClick={submit} disabled={!!draft}>Submit review</button>
            <span className="small muted">{draft ? 'Save or cancel the open flag first.' : `${Object.keys(flags).length} flagged`}</span>
          </div>
        )}
      </div>
    </div>
  );
}
