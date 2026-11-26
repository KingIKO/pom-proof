import { useRef, useState, type FormEvent } from 'react';
import type { BugDef, BugHuntItem } from '../content/types';
import type { LabProps } from '../pages/Workspace';
import { bugApps } from './bughunt/registry';
import './bughunt.css';

const severities: BugDef['severity'][] = ['Critical', 'Major', 'Minor', 'Trivial'];
const words = (s: string) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
const ignored = new Set(['the', 'and', 'for', 'with', 'without', 'after', 'from', 'shorter', 'than', 'shows']);
type Draft = { title: string; area: string; steps: string; expected: string; actual: string; severity: string };
type Report = { title: string; bug: BugDef; quality: number; feedback: string[] } | { title: string; bug?: undefined };
const empty: Draft = { title: '', area: '', steps: '', expected: '', actual: '', severity: '' };

function review(draft: Draft, bug: BugDef) {
  const title = words(draft.title);
  const terms = words(`${bug.area} ${bug.title}`).filter((term) => term.length >= 3 && !ignored.has(term));
  const numbered = draft.steps.split(/(?:^|\s)\d+[.)]\s+/).slice(1).filter((step) => step.trim()).length;
  const lines = draft.steps.split(/\n/).filter((step) => step.replace(/^\s*(?:\d+[.)]|[-*])\s*/, '').trim()).length;
  const severityIndex = severities.findIndex((severity) => severity === draft.severity);
  const checks = [
    { ok: title.length >= 4 && title.some((word) => terms.includes(word)), feedback: 'Use at least four words and name the affected area or symptom.' },
    { ok: Math.max(numbered, lines) >= 2, feedback: 'Give at least two numbered steps or put each step on a separate line.' },
    { ok: normalize(draft.expected) !== '' && normalize(draft.actual) !== '' && normalize(draft.expected) !== normalize(draft.actual), feedback: 'Describe the expected and actual results separately.' },
    { ok: severityIndex !== -1 && Math.abs(severityIndex - severities.indexOf(bug.severity)) <= 1, feedback: 'Choose a severity that matches the impact of the defect.' },
  ];
  return { quality: checks.filter(({ ok }) => ok).length * 25, feedback: checks.filter(({ ok }) => !ok).map(({ feedback }) => feedback) };
}

function grade(reports: Report[], count: number) {
  const confirmed = reports.filter((report) => report.bug !== undefined);
  const falseReports = reports.length - confirmed.length;
  const quality = confirmed.length ? confirmed.reduce((sum, report) => sum + report.quality, 0) / confirmed.length : 0;
  const score = Math.max(0, Math.round((count ? confirmed.length / count : 0) * 70 + quality * 0.3 - 5 * falseReports));
  return { confirmed, falseReports, score, solved: count > 0 && confirmed.length === count };
}

export default function BugHuntLab({ item, onResult }: LabProps<BugHuntItem>) {
  const App = bugApps.get(item.app);
  const [session, setSession] = useState(0);
  const [draft, setDraft] = useState<Draft>(empty);
  const [reports, setReports] = useState<Report[]>([]);
  const triggers = useRef<string[]>([]);
  const { confirmed, falseReports, score, solved } = grade(reports, item.bugs.length);
  const latest = reports.at(-1);

  function onTrigger(id: string) {
    if (!item.bugs.some((bug) => bug.id === id)) return;
    triggers.current = [...triggers.current.filter((previous) => previous !== id), id];
  }

  function report(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.title.trim() || !item.areas.includes(draft.area)) return;
    const alreadyReported = new Set(confirmed.map(({ bug }) => bug.id));
    const bug = [...triggers.current].reverse().map((id) => item.bugs.find((candidate) => candidate.id === id))
      .find((candidate) => candidate && candidate.area === draft.area && !alreadyReported.has(candidate.id));
    const entry: Report = bug
      ? { title: draft.title.trim(), bug, ...review(draft, bug) }
      : { title: draft.title.trim() };
    const next = [...reports, entry];
    const result = grade(next, item.bugs.length);
    setReports(next);
    setDraft(empty);
    onResult(result.solved, result.score);
  }

  function restart() {
    triggers.current = [];
    setReports([]);
    setDraft(empty);
    setSession((i) => i + 1);
  }

  const update = (name: keyof Draft, value: string) => setDraft((previous) => ({ ...previous, [name]: value }));

  if (!App) return <p className="empty">This practice app is unavailable.</p>;

  return (
    <div className="split-v bug-hunt">
      <header className="ws-toolbar bug-hunt-toolbar">
        <strong role="status" className="num">Bugs confirmed: {confirmed.length} of {item.bugs.length}</strong>
        <span className="grow" />
        <button type="button" className="btn btn--ghost btn--sm" onClick={restart}>Restart session</button>
      </header>
      <div className="ws-scroll bug-hunt-scroll">
        <div className="bug-hunt-layout">
          <App key={session} onTrigger={onTrigger} />
          <section className="bug-report" aria-label="Bug report">
            <h2 className="h3">Bug report</h2>
            <p className="small muted">Reproduce the issue in the app before filing.</p>
            {latest && (
              <p className={`notice ${latest.bug ? 'notice--ok' : 'notice--warn'}`} role="status">
                {latest.bug ? `Confirmed: ${latest.bug.title}` : 'Could not match this report to an issue reproduced in this session.'}
              </p>
            )}
            {solved ? <p className="small pass">All bugs confirmed.</p> : (
              <form onSubmit={report} className="bug-report-form">
                <label className="field"><span>Report title</span><input className="input" value={draft.title} onChange={(e) => update('title', e.target.value)} required /></label>
                <div className="bug-report-pair">
                  <label className="field">
                    <span id="bug-report-area">Area</span>
                    <select className="select" aria-labelledby="bug-report-area" value={draft.area} onChange={(e) => update('area', e.target.value)} required>
                      <option value="">Select area</option>
                      {item.areas.map((area) => <option key={area}>{area}</option>)}
                    </select>
                  </label>
                  <label className="field">
                    <span id="bug-report-severity">Severity</span>
                    <select className="select" aria-labelledby="bug-report-severity" value={draft.severity} onChange={(e) => update('severity', e.target.value)}>
                      <option value="">Select severity</option>
                      {severities.map((severity) => <option key={severity}>{severity}</option>)}
                    </select>
                  </label>
                </div>
                <label className="field"><span>Steps to reproduce</span><textarea className="textarea" value={draft.steps} onChange={(e) => update('steps', e.target.value)} rows={3} /></label>
                <div className="bug-report-pair">
                  <label className="field"><span>Expected result</span><textarea className="textarea" value={draft.expected} onChange={(e) => update('expected', e.target.value)} rows={2} /></label>
                  <label className="field"><span>Actual result</span><textarea className="textarea" value={draft.actual} onChange={(e) => update('actual', e.target.value)} rows={2} /></label>
                </div>
                <button type="submit" className="btn btn--primary">File report</button>
              </form>
            )}
          </section>
        </div>
        {reports.length > 0 && (
          <section className="bug-report-history" aria-label="Filed reports">
            <div className="bug-between">
              <h2 className="h3">Filed reports</h2>
              <span className="caption num">Score {score}% · {falseReports} unmatched</span>
            </div>
            <ol>
              {[...reports].reverse().map((entry, i) => (
                <li key={reports.length - i}>
                  <div className="bug-between">
                    <strong>{entry.title}</strong>
                    <span className={entry.bug ? 'small pass' : 'small warn'}>{entry.bug ? `Quality ${entry.quality}%` : 'Unmatched'}</span>
                  </div>
                  {entry.bug ? (
                    <>
                      <div className="small">{entry.bug.title}</div>
                      {entry.feedback.length ? <ul className="small">{entry.feedback.map((note) => <li key={note}>{note}</li>)}</ul>
                        : <p className="caption">All report checks passed.</p>}
                    </>
                  ) : <p className="caption">Reproduce the issue and file under the affected area. This report costs 5 points.</p>}
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    </div>
  );
}

