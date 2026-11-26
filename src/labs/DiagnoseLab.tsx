import { useRef, useState } from 'react';
import type { DiagnoseItem } from '../content/types';
import type { LabProps } from '../pages/Workspace';
import { Verdict } from './shared';
import './forms.css';

export default function DiagnoseLab({ item, onResult }: LabProps<DiagnoseItem>) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const firstScore = useRef<number | null>(null);
  const right = item.questions.filter((question, i) => question.options[selected[i]]?.correct).length;
  const solved = right === item.questions.length;

  function check() {
    const score = Math.round(100 * right / item.questions.length);
    if (firstScore.current === null) {
      firstScore.current = score;
      onResult(solved, score);
    } else if (solved) {
      onResult(true, firstScore.current);
    }
    setChecked(true);
  }

  return (
    <div className="split-v">
      <div className="ws-scroll forms-lab">
        <section className="forms-stack" aria-labelledby="diagnose-code">
          <h2 className="h3" id="diagnose-code">Test code <span className="caption">· {item.lang}</span></h2>
          <div className="code-view forms-code" tabIndex={0} role="region" aria-labelledby="diagnose-code">
            {item.code.replace(/^\r?\n/, '').split(/\r?\n/).map((line, i) => (
              <div className="code-line" key={i}>
                <span className="ln" aria-hidden="true">{i + 1}</span>
                <code className="forms-source-line">{line || ' '}</code>
              </div>
            ))}
          </div>
        </section>
        <section className="forms-stack" aria-labelledby="diagnose-log">
          <h2 className="h3" id="diagnose-log">Run log</h2>
          <pre className="log-view" tabIndex={0} aria-labelledby="diagnose-log">{item.log}</pre>
        </section>
        {item.questions.map((question, i) => (
          <fieldset className="forms-fieldset forms-stack" key={question.prompt}>
            <legend className="h3">{i + 1}. {question.prompt}</legend>
            <div className="option-list">
              {question.options.map((option, j) => {
                const chosen = selected[i] === j;
                const status = checked && option.correct ? 'right' : checked && chosen ? 'wrong' : '';
                return (
                  <label className={`option forms-choice${status ? ` option--${status}` : ''}`} key={option.text}>
                    <input type="radio" className="sr-only" name={`diagnose-${i}`} checked={chosen} disabled={checked} onChange={() => setSelected((previous) => ({ ...previous, [i]: j }))} />
                    <span className="radio-dot" aria-hidden="true" />
                    <span>{option.text}</span>
                    {checked && (
                      <span className="why">
                        {status === 'right' && <strong>Correct answer. </strong>}
                        {status === 'wrong' && <strong>Your choice was incorrect. </strong>}
                        {option.why}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
        {checked ? (
          <>
            <Verdict ok={solved || 'partial'} title={solved ? 'Diagnosis complete' : 'Review the explanations'} detail={`${right} of ${item.questions.length} correct · First score ${firstScore.current}%`} />
            <div><button type="button" className="btn" onClick={() => { setSelected({}); setChecked(false); }}>Try again</button></div>
          </>
        ) : (
          <div className="btn-row">
            <button type="button" className="btn btn--primary" disabled={Object.keys(selected).length !== item.questions.length} onClick={check}>Check</button>
            {Object.keys(selected).length !== item.questions.length && <span className="caption">Choose one answer per question.</span>}
          </div>
        )}
      </div>
    </div>
  );
}
