import { useEffect, useRef, useState } from 'react';
import type { ChecklistEntry, ScenarioItem } from '../content/types';
import type { LabProps } from '../pages/Workspace';
import { Timer, Verdict } from './shared';
import './forms.css';

type Phase = 'brainstorm' | 'checklist' | 'priorities' | 'complete';

function words(text: string) {
  return text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
}

function suggest(notes: string, entries: ChecklistEntry[]) {
  const ideas = notes.split(/\r?\n/).map(words);
  return new Set(entries.filter(({ keywords }) => keywords.some((keyword) => {
    const parts = words(keyword);
    return parts.length > 0 && ideas.some((idea) => idea.some((_, start) =>
      parts.every((part, offset) => idea[start + offset]?.startsWith(part)),
    ));
  })).map(({ id }) => id));
}

function toggle(set: Set<string>, id: string) {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
}

const percent = (share: number) => `${Math.round(share * 100)}%`;

export default function ScenarioLab({ item, onResult }: LabProps<ScenarioItem>) {
  const [phase, setPhase] = useState<Phase>('brainstorm');
  const [notes, setNotes] = useState('');
  const [suggested, setSuggested] = useState(new Set<string>());
  const [checked, setChecked] = useState(new Set<string>());
  const [picked, setPicked] = useState(new Set<string>());
  const startedComparison = useRef(false);
  const heading = useRef<HTMLHeadingElement | null>(null);
  const priority = item.prioritize;
  const areas = [...new Set(item.checklist.map(({ area }) => area))];
  const weight = item.checklist.reduce((n, entry) => n + entry.weight, 0);
  const coveredWeight = item.checklist.reduce((n, entry) => n + (checked.has(entry.id) ? entry.weight : 0), 0);
  const coverage = coveredWeight / weight;
  const highCount = priority?.candidates.filter(({ id, value }) => picked.has(id) && value === 'high').length ?? 0;
  const highShare = priority ? highCount / priority.budget : 0;
  const score = priority ? coverage * 0.7 + highShare * 0.3 : coverage;
  const solved = coverage >= 0.7 && (!priority || highShare >= 0.6);

  useEffect(() => {
    if (phase !== 'brainstorm') heading.current?.focus();
  }, [phase]);

  function compare() {
    if (startedComparison.current) return;
    startedComparison.current = true;
    const matches = suggest(notes, item.checklist);
    setSuggested(matches);
    setChecked(matches);
    setPhase('checklist');
  }

  function finish() {
    onResult(solved, Math.round(score * 100));
    setPhase('complete');
  }

  return (
    <div className="split-v">
      <div className="ws-scroll forms-lab">
        {phase === 'brainstorm' && (
          <>
            <div className="forms-stage-head">
              <h2 className="h3">Brainstorm test ideas</h2>
              <Timer seconds={item.minutes * 60} onDone={() => queueMicrotask(compare)} />
            </div>
            <label className="field">
              <span>One test idea per line</span>
              <textarea className="textarea forms-textarea" value={notes} onChange={(e) => setNotes(e.currentTarget.value)} />
            </label>
            <div className="btn-row">
              <button type="button" className="btn btn--primary" onClick={compare}>Compare with the key</button>
              <span className="caption">Finish early or compare when time is up.</span>
            </div>
          </>
        )}
        {phase === 'checklist' && (
          <>
            <header className="forms-stack">
              <h2 className="h3" tabIndex={-1} ref={heading}>Confirm your coverage</h2>
              <p className="small">Keywords suggest matches. Check only the ideas you covered, and uncheck suggestions that do not fit. Weight 3 marks ideas interviewers expect.</p>
            </header>
            {notes.trim() && <details className="notice"><summary>Your brainstorm</summary><p className="forms-ideas">{notes}</p></details>}
            <p className="notice" aria-live="polite"><strong>{percent(coverage)} weighted coverage</strong> · {coveredWeight} of {weight} points</p>
            {areas.map((area) => (
              <fieldset className="forms-fieldset forms-stack" key={area}>
                <legend className="h3">{area}</legend>
                <ul className="checklist">
                  {item.checklist.filter((entry) => entry.area === area).map((entry) => {
                    const id = `scenario-check-${entry.id}`;
                    return (
                      <li key={entry.id}>
                        <input type="checkbox" id={id} checked={checked.has(entry.id)} onChange={() => setChecked((previous) => toggle(previous, entry.id))} />
                        <div>
                          <label htmlFor={id}>{entry.idea}</label>
                          {suggested.has(entry.id) && <p className="caption">Keyword match</p>}
                        </div>
                        <span className="weight">Weight {entry.weight}</span>
                      </li>
                    );
                  })}
                </ul>
              </fieldset>
            ))}
            <div>
              {priority
                ? <button type="button" className="btn btn--primary" onClick={() => setPhase('priorities')}>Choose priorities</button>
                : <button type="button" className="btn btn--primary" onClick={finish}>Finish scenario</button>}
            </div>
          </>
        )}
        {phase === 'complete' && (
          <header className="forms-stack">
            <h2 className="h3" tabIndex={-1} ref={heading}>Scenario results</h2>
            <Verdict ok={solved || 'partial'} title={solved ? 'Scenario complete' : 'Review your coverage'} detail={`${percent(score)} · ${percent(coverage)} self-confirmed coverage${priority ? ` · ${highCount} of ${priority.budget} high-value picks` : ''}`} />
            <p className="small muted">To solve: at least 70% weighted coverage{priority ? ' and 60% high-value picks' : ''}.</p>
          </header>
        )}
        {priority && (phase === 'priorities' || phase === 'complete') && (
          <>
            {phase === 'priorities' && (
              <header className="forms-stack">
                <h2 className="h3" tabIndex={-1} ref={heading}>Prioritize under a budget</h2>
                <p>{priority.question}</p>
                <p className="small muted" aria-live="polite">{picked.size} of {priority.budget} selected</p>
              </header>
            )}
            <ul className="checklist forms-priorities" aria-label={phase === 'complete' ? 'Priority key' : 'Priority candidates'}>
              {priority.candidates.map((candidate) => {
                const id = `scenario-pick-${candidate.id}`;
                const selected = picked.has(candidate.id);
                return (
                  <li key={candidate.id}>
                    <input type="checkbox" id={id} checked={selected} disabled={phase === 'complete' || (!selected && picked.size === priority.budget)} onChange={() => setPicked((previous) => toggle(previous, candidate.id))} />
                    <label htmlFor={id}>{candidate.text}</label>
                    {phase === 'complete' && <p className="why small"><strong className="forms-value">{candidate.value} value.</strong> {candidate.why}</p>}
                  </li>
                );
              })}
            </ul>
            {phase === 'priorities' && (
              <div className="btn-row">
                <button type="button" className="btn" onClick={() => setPhase('checklist')}>Back to checklist</button>
                <button type="button" className="btn btn--primary" disabled={picked.size !== priority.budget} onClick={finish}>Check priorities</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
