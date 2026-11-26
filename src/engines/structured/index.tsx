import { useId, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { GradeResult, Problem, StructuredKind } from '../../lib/contracts';
import { recordResult, useGradeHook } from '../../lib/workspace';
import ResultPanel from '../../components/shell/ResultPanel';
import { budgetSpent, grade } from './grade';
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

function Ordering({ item, picks, onChange }: {
  item: Extract<Item, { type: 'ordering' }>;
  picks: string[];
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
            <span>{choices.get(pick)}</span>
            <div class="structured-moves">
              <button
                id={buttonId(pick, -1)}
                type="button"
                aria-label={`Move up: ${choices.get(pick)}`}
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                Move up
              </button>
              <button
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

function Controls({ item, name, value, onChange }: {
  item: Item;
  name: string;
  value: Values[string] | undefined;
  onChange: Update;
}) {
  const picks = Array.isArray(value) ? value : [];
  if (item.type === 'ordering') return <Ordering item={item} picks={picks} onChange={onChange} />;
  if (item.type === 'line-marking') {
    return (
      <ol class="structured-code" aria-label="Numbered lines">
        {item.lines.map((line, index) => (
          <li key={line.id}>
            <button
              type="button"
              aria-pressed={picks.includes(line.id)}
              onClick={() => onChange(toggle(picks, line.id))}
            >
              <span><span class="visually-hidden">Line </span>{index + 1}</span>{' '}
              <code>{line.text}</code>
            </button>
          </li>
        ))}
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
          {spent !== null && spent > item.budget && '. Remove a pick to stay within budget.'}
        </p>
      )}
      <ul class="structured-options">
        {item.choices.map((choice) => (
          <li key={choice.id}>
            <label>
              <input
                type={single ? 'radio' : 'checkbox'}
                name={name}
                value={choice.id}
                checked={single ? value === choice.id : picks.includes(choice.id)}
                onChange={() => onChange(single ? choice.id : toggle(picks, choice.id))}
              />
              <span>
                {choice.text}
                {'cost' in choice && <span class="muted"> ({choice.cost})</span>}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </>
  );
}

function RightAnswer({ item, value }: { item: Item; value: Values[string] }) {
  const options = item.type === 'line-marking' ? item.lines : item.choices;
  if (typeof value === 'string') {
    return <p><strong>Right answer:</strong> {options.find(({ id }) => id === value)?.text}</p>;
  }
  const entries = value.map((id) => {
    const index = options.findIndex((option) => option.id === id);
    const text = options[index].text;
    return <li key={id}>{item.type === 'line-marking' ? <>Line {index + 1}: <code>{text}</code></> : text}</li>;
  });
  return (
    <div class="structured-key">
      <strong>Right answer:</strong>
      {entries.length === 0 ? ' No selections'
        : item.type === 'ordering' ? <ol>{entries}</ol>
          : <ul>{entries}</ul>}
    </div>
  );
}

export default function Structured({ problem }: { problem: StructuredProblem }) {
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
        <div class="structured-scratch">
          <label for={`${id}-scratch`}>Write your own ideas first</label>
          <p id={`${id}-scratch-hint`} class="muted">Notes are not graded.</p>
          <textarea
            id={`${id}-scratch`}
            aria-describedby={`${id}-scratch-hint`}
            rows={4}
            value={scratch}
            disabled={!ready}
            onInput={(event) => setScratch(event.currentTarget.value)}
          />
        </div>
      )}
      <div ref={itemsRef} key={attempt}>
        {problem.items.map((item) => {
          const name = `${id}-${item.id}`;
          return (
            <fieldset key={item.id} disabled={!ready || graded} aria-describedby={item.type === 'budgeted-pick' ? `${name}-budget` : undefined}>
              <legend>{item.prompt}</legend>
              <Controls
                item={item}
                name={name}
                value={values[item.id]}
                onChange={(value) => update(item.id, value)}
              />
              {graded && <RightAnswer item={item} value={problem.reference[item.id]} />}
            </fieldset>
          );
        })}
      </div>
      {!graded && <button class="primary" type="button" disabled={!ready} onClick={submit}>Submit</button>}
      {result !== null && (
        <div ref={resultRef} tabIndex={-1}>
          <ResultPanel result={result} misses={misses} />
        </div>
      )}
      {graded && <button type="button" onClick={retry}>Try again</button>}
    </form>
  );
}
