import { useEffect, useRef, useState, type RefObject } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { dailySet, QUESTIONS } from '../content';
import type { Question } from '../content/types';
import { getState, rateCard, type CardState } from '../lib/store';
import { matchQuestions, QuestionAnswer } from './Questions';
import './pages.css';

type Rating = CardState['last'];

export const RATINGS = [
  { value: 'missed', label: 'Missed', key: '1' },
  { value: 'shaky', label: 'Shaky', key: '2' },
  { value: 'solid', label: 'Solid', key: '3' },
] as const;

export function RateButtons({ onRate, shortcuts = false, first }: {
  onRate: (rating: Rating) => void;
  shortcuts?: boolean;
  first?: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="rate-row" role="group" aria-label="Rate your answer">
      {RATINGS.map(({ value, label, key }, i) => (
        <button type="button" className="btn" key={value} onClick={() => onRate(value)} ref={i === 0 ? first : undefined}
          aria-keyshortcuts={shortcuts ? key : undefined}>
          {label}{shortcuts && <kbd aria-hidden="true">{key}</kbd>}
        </button>
      ))}
    </div>
  );
}

export function Countdown({ deadline }: { deadline: number }) {
  const [now, setNow] = useState(Date.now);
  const seconds = Math.max(0, Math.ceil((deadline - now) / 1000));
  useEffect(() => {
    if (seconds === 0) return;
    const timer = window.setTimeout(() => setNow(Date.now()), Math.max(40, (deadline - now) % 1000 || 1000));
    return () => window.clearTimeout(timer);
  }, [deadline, now, seconds]);
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  return <span className={`timer num${seconds <= 10 ? ' timer--low' : ''}`} role="timer" aria-label={`${seconds} seconds remaining`}>{seconds === 0 ? 'Time up' : clock}</span>;
}

function Flashcard({ question, onRate, position, total }: { question: Question; onRate: (rating: Rating) => void; position: number; total: number }) {
  const [revealed, setRevealed] = useState(false);
  const [deadline, setDeadline] = useState<number | null>(null);
  const show = useRef<HTMLButtonElement>(null);
  const firstRating = useRef<HTMLButtonElement>(null);
  const prompt = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (revealed) firstRating.current?.focus();
    else if (position > 1) prompt.current?.focus();
  }, [position, revealed]);

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat || event.defaultPrevented) return;
      const target = event.target;
      if (target instanceof HTMLElement && target.closest('input,select,textarea,[contenteditable]')) return;
      if (!revealed && event.code === 'Space' && (!(target instanceof HTMLElement && target.closest('button,a,summary')) || target === show.current)) {
        event.preventDefault();
        setRevealed(true);
      }
      const rating = RATINGS.find((r) => r.key === event.key);
      if (revealed && rating) {
        event.preventDefault();
        onRate(rating.value);
      }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [revealed, onRate]);

  return (
    <section className="panel panel-pad pp-round" aria-labelledby="card-prompt">
      <div className="pp-row small">
        <span className="num">Card {position} of {total}</span>
        <span>{question.topic}</span>
      </div>
      <h2 className="card-q" id="card-prompt" tabIndex={-1} ref={prompt}>{question.question}</h2>
      {!revealed ? (
        <div className="btn-row">
          <button ref={show} className="btn btn--primary" aria-keyshortcuts="Space" onClick={() => setRevealed(true)}>Show answer</button>
          {deadline === null
            ? <button className="btn btn--ghost" onClick={() => setDeadline(Date.now() + 60_000)}>Start 1-minute timer</button>
            : <Countdown deadline={deadline} />}
        </div>
      ) : (
        <>
          <QuestionAnswer question={question} />
          <p className="small pp-secondary">How well did you answer?</p>
          <RateButtons shortcuts first={firstRating} onRate={onRate} />
        </>
      )}
    </section>
  );
}

function buildQueue(params: URLSearchParams) {
  const now = Date.now();
  const { cards } = getState();
  const source = params.get('daily') === '1' ? dailySet().questions : QUESTIONS;
  const dueOnly = params.get('due') === '1';
  function priority(id: string) {
    const card = cards[id];
    if (!card) return 1;
    return card.due <= now ? 0 : 2;
  }
  const matching = matchQuestions(source, params);
  return matching
    .filter((question) => !dueOnly || priority(question.id) === 0)
    .sort((a, b) => {
      const rank = priority(a.id);
      const difference = rank - priority(b.id);
      return difference || (rank === 0 ? cards[a.id].due - cards[b.id].due : 0);
    });
}

function PracticeSession({ params }: { params: URLSearchParams }) {
  const [queue, setQueue] = useState(() => buildQueue(params));
  const [results, setResults] = useState<{ topic: string; rating: Rating }[]>([]);
  const [ended, setEnded] = useState(false);
  const summary = useRef<HTMLHeadingElement>(null);
  const question = queue[results.length];
  const bankParams = new URLSearchParams(params);
  bankParams.delete('daily');
  bankParams.delete('due');
  const bankLink = { pathname: '/questions', search: bankParams.toString() };

  useEffect(() => {
    if (ended || (queue.length && !question)) summary.current?.focus();
  }, [ended, queue.length, question]);

  function startAgain() {
    setQueue(buildQueue(params));
    setResults([]);
    setEnded(false);
  }

  if (!queue.length) {
    return (
      <div className="notice pp-actions">
        <p>{params.get('due') === '1' ? 'No cards are due. Browse the question bank for more practice.' : 'No cards match these filters. Change them in the question bank.'}</p>
        <Link to={bankLink}>Browse questions</Link>
      </div>
    );
  }
  if (!question || ended) {
    const weak = new Map<string, number>();
    for (const { rating, topic } of results) if (rating !== 'solid') weak.set(topic, (weak.get(topic) ?? 0) + 1);
    return (
      <section className="section" aria-labelledby="review-summary">
        <h2 className="h2" id="review-summary" tabIndex={-1} ref={summary}>Session summary</h2>
        <p className="num">{results.length} {results.length === 1 ? 'card' : 'cards'} rated</p>
        <div className="stat-row">
          {RATINGS.map(({ value, label }) => <div className="stat" key={value}><div className="v">{results.filter((result) => result.rating === value).length}</div><div className="l">{label}</div></div>)}
        </div>
        {weak.size > 0 && (
          <div className="pp-actions">
            <h3 className="h3">Drill next</h3>
            <ul className="pp-link-list">
              {[...weak].sort((a, b) => b[1] - a[1]).map(([topic, count]) => (
                <li key={topic}><Link to={{ pathname: '/questions/practice', search: new URLSearchParams({ topic }).toString() }}>{topic}</Link> <span className="caption">({count} missed or shaky)</span></li>
              ))}
            </ul>
          </div>
        )}
        <div className="btn-row pp-actions">
          {params.get('due') !== '1' && <button className="btn btn--primary" onClick={startAgain}>Start again</button>}
          <Link className={params.get('due') === '1' ? 'btn btn--primary' : 'btn'} to={bankLink}>Browse questions</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Flashcard key={question.id} question={question} position={results.length + 1} total={queue.length} onRate={(rating) => {
        rateCard(question.id, rating);
        setResults([...results, { topic: question.topic, rating }]);
      }} />
      <div className="btn-row pp-actions">
        {results.length > 0 && <button className="btn btn--ghost" onClick={() => setEnded(true)}>Finish session</button>}
        <Link className="pp-text-link" to={bankLink}>Back to questions</Link>
      </div>
      <p className="caption pp-key-help"><kbd>Space</kbd> shows the answer. <kbd>1</kbd>, <kbd>2</kbd> and <kbd>3</kbd> rate it.</p>
    </>
  );
}

export default function Practice() {
  const [params] = useSearchParams();
  const { key } = useLocation();
  return (
    <div className="page page--narrow">
      <h1 className="h1">Flashcard practice</h1>
      <p className="lede">Answer out loud, then reveal the model answer and rate your recall.</p>
      <PracticeSession key={key} params={params} />
    </div>
  );
}

