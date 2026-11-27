import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { GradeResult, Problem, StructuredKind } from '../../lib/contracts';
import { recordResult, useGradeHook } from '../../lib/workspace';
import ResultPanel from '../../components/shell/ResultPanel';
import { budgetSpent, grade } from './grade';
import type { MarkedCode } from './highlight';
import './workspace.css';

type StructuredProblem = Problem<StructuredKind>;
type Item = StructuredProblem['items'][number];
type Values = StructuredProblem['reference'];
type Update = (value: string | string[]) => void;

function initialValues(items: Item[]): Values {
  const values: Values = {};
  for (const item of items) {
    if (item.type === 'ordering') values[item.id] = item.choices.map(({ id }) => id).reverse();
    else if (item.type !== 'single-choice') values[item.id] = [];
  }
  return values;
}

function toggle(picks: string[], id: string) {
  return picks.includes(id) ? picks.filter((pick) => pick !== id) : [...picks, id];
}

function optionFeedback(correct: boolean, picked: boolean) {
  if (correct) return { status: 'pass', label: picked ? 'Your answer, correct' : 'Correct answer' };
  if (picked) return { status: 'fail', label: 'Your answer' };
}

function Ordering({ item, picks, reference, onChange }: {
  item: Extract<Item, { type: 'ordering' }>;
  picks: string[];
  reference?: string[];
  onChange: Update;
}) {
  const id = useId();
  const nextFocus = useRef<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const choices = new Map(item.choices.map(({ id, text }) => [id, text]));
  const buttonId = (pick: string, direction: number) => `${id}-${pick}-${direction}`;

  useLayoutEffect(() => {
    if (nextFocus.current !== null) {
      document.getElementById(nextFocus.current)?.focus();
      nextFocus.current = null;
    }
  }, [picks]);

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= picks.length) return;
    const pick = picks[index];
    const next = [...picks];
    [next[index], next[target]] = [next[target], next[index]];
    const canMoveAgain = target + direction >= 0 && target + direction < next.length;
    nextFocus.current = buttonId(pick, canMoveAgain ? direction : -direction);
    setAnnouncement(`${choices.get(pick)} Position ${target + 1} of ${next.length}.`);
    onChange(next);
  }

  return (
    <>
      <ol class="structured-order">
        {picks.map((pick, index) => (
          <li key={pick}>
            <span>
              {choices.get(pick)}
              {reference && <span class="structured-feedback">Correct position: {reference.indexOf(pick) + 1}</span>}
            </span>
            <div class="structured-moves">
              <button
                class="button outline"
                id={buttonId(pick, -1)}
                type="button"
                aria-label={`Move up: ${choices.get(pick)}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                Move up
              </button>
              <button
                class="button outline"
                id={buttonId(pick, 1)}
                type="button"
                aria-label={`Move down: ${choices.get(pick)}`}
                disabled={index === picks.length - 1}
                onClick={() => move(index, 1)}
              >
                Move down
              </button>
            </div>
          </li>
        ))}
      </ol>
      <span class="visually-hidden" role="status">{announcement}</span>
    </>
  );
}

function Controls({ item, name, value, reference, onChange, code }: {
  item: Item;
  name: string;
  value: Values[string] | undefined;
  reference?: Values[string];
  onChange: Update;
  code?: MarkedCode[string];
}) {
  const picks = Array.isArray(value) ? value : [];
  const expected = Array.isArray(reference) ? reference : reference === undefined ? undefined : [reference];
  if (item.type === 'ordering') return <Ordering item={item} picks={picks} reference={expected} onChange={onChange} />;
  if (item.type === 'line-marking') {
    return (
      <ol class="structured-code" role="list" aria-label="Numbered lines">
        {item.lines.map((line, index) => {
          const picked = picks.includes(line.id);
          const feedback = expected && optionFeedback(expected.includes(line.id), picked);
          const tokens = feedback ? undefined : code?.[index];
          return (
            <li key={line.id}>
              <button
                class="button structured-line"
                type="button"
                aria-pressed={picked}
                data-feedback={feedback?.status}
                onClick={() => onChange(toggle(picks, line.id))}
              >
                <span class="structured-line-number"><span class="visually-hidden">Line </span>{index + 1}</span>{' '}
                <span>
                  <code>{tokens?.map(([text, color], token) =>
                    color ? <span key={token} style={{ color }}>{text}</span> : text) ?? line.text}</code>
                  {feedback && <span class="structured-feedback">{feedback.label}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    );
  }
  const single = item.type === 'single-choice';
  const spent = item.type === 'budgeted-pick' ? budgetSpent(item, picks) : null;
  return (
    <>
      {item.type === 'budgeted-pick' && (
        <p id={`${name}-budget`} class="structured-budget" role="status">
          Spent {spent} of {item.budget}
          {spent !== null && spent > item.budget && '. Remove a choice to stay within budget.'}
        </p>
      )}
      <ul class="structured-options" role="list">
        {item.choices.map((choice) => {
          const picked = single ? value === choice.id : picks.includes(choice.id);
          const feedback = expected && optionFeedback(expected.includes(choice.id), picked);
          return (
            <li key={choice.id}>
              <label class="structured-option" data-feedback={feedback?.status}>
                <input
                  type={single ? 'radio' : 'checkbox'}
                  name={name}
                  value={choice.id}
                  checked={picked}
                  onChange={() => onChange(single ? choice.id : toggle(picks, choice.id))}
                />
                <span>
                  {choice.text}
                  {'cost' in choice && <span class="muted"> ({choice.cost})</span>}
                  {feedback && <span class="structured-feedback">{feedback.label}</span>}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function Structured({ problem, markedCode }: { problem: StructuredProblem; markedCode: MarkedCode }) {
  useGradeHook<StructuredKind>(problem, grade);
  const id = useId();
  const [ready, setReady] = useState(false);
  const [values, setValues] = useState(() => initialValues(problem.items));
  const [scratch, setScratch] = useState('');
  const [result, setResult] = useState<GradeResult<StructuredKind> | null>(null);
  const [attempt, setAttempt] = useState(0);
  const itemsRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const graded = result?.status === 'graded';
  const misses = graded
    ? result.details.items.flatMap(({ id, passed, note }) => {
      const item = problem.items.find((item) => item.id === id);
      return !passed && note && item ? [`${item.prompt} ${note}`] : [];
    })
    : undefined;

  useLayoutEffect(() => setReady(true), []);

  useLayoutEffect(() => {
    if (result !== null) resultRef.current?.focus();
  }, [result]);

  useLayoutEffect(() => {
    if (attempt > 0) {
      itemsRef.current?.querySelector<HTMLElement>('input, button:not(:disabled)')?.focus();
    }
  }, [attempt]);

  function submit() {
    if (graded) return;
    const next = grade(problem, { kind: problem.kind, value: values });
    setResult(next);
    recordResult(problem.id, next);
  }

  function retry() {
    setValues(initialValues(problem.items));
    setResult(null);
    setAttempt((current) => current + 1);
  }

  function update(id: string, value: Values[string]) {
    setValues((current) => ({ ...current, [id]: value }));
    if (result?.status === 'invalid-answer') setResult(null);
  }

  return (
    <form
      class="structured-workspace"
      data-engine="structured"
      onSubmit={(event) => event.preventDefault()}
    >
      {problem.kind === 'scenario' && (
        <div class="structured-scratch" data-card>
          <label for={`${id}-scratch`}>Write your own ideas first</label>
          <p id={`${id}-scratch-hint`} class="muted">Notes are not graded.</p>
          <textarea
            class="input"
            id={`${id}-scratch`}
            aria-describedby={`${id}-scratch-hint`}
            rows={4}
            value={scratch}
            disabled={!ready}
            onInput={(event) => setScratch(event.currentTarget.value)}
          />
        </div>
      )}
      <div class="structured-items" ref={itemsRef} key={attempt}>
        {problem.items.map((item) => {
          const name = `${id}-${item.id}`;
          const reference = graded ? problem.reference[item.id] : undefined;
          return (
            <div key={item.id} class="structured-item" data-card>
              <fieldset disabled={!ready || graded} aria-describedby={item.type === 'budgeted-pick' ? `${name}-budget` : undefined}>
                <legend>{item.prompt}</legend>
                <Controls
                  item={item}
                  name={name}
                  value={values[item.id]}
                  reference={reference}
                  onChange={(value) => update(item.id, value)}
                  code={markedCode[item.id]}
                />
                {Array.isArray(reference) && reference.length === 0 && (
                  <p class="structured-feedback">Correct answer: no selections</p>
                )}
              </fieldset>
            </div>
          );
        })}
      </div>
      {!graded && <div class="engine-actions">
        <button class="button primary" type="button" disabled={!ready} onClick={submit}>Submit</button>
      </div>}
      {result !== null && (
        <div ref={resultRef} tabIndex={-1}>
          <ResultPanel result={result} misses={misses} />
        </div>
      )}
      {graded && <div class="engine-actions">
        <button class="button outline" type="button" onClick={retry}>Try again</button>
      </div>}
    </form>
  );
}
