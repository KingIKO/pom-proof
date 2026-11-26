import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ITEMS, ITEM_BY_ID, QUESTIONS, QUESTION_BY_ID } from '../content';
import { KIND_INFO, ROLE_INFO } from '../content/kinds';
import type { PracticeItem, Question, Role } from '../content/types';
import { useStore, type CardState, type ItemProgress, type State } from '../lib/store';
import { Countdown, RateButtons } from './Practice';
import { QuestionAnswer } from './Questions';
import './pages.css';

const SESSION_KEY = 'pomproof:mock:v1';
const PROGRESS_KEY = 'pomproof:v1';
const roles = Object.keys(ROLE_INFO) as Role[];
const areas = ['Concepts', 'Test design', 'Automation', 'Data/SQL', 'Behavioral'] as const;
type Area = typeof areas[number];
type Length = 'short' | 'full';
type Rating = CardState['last'];
type Round = { id: string; type: 'question' | 'item'; area: Area; minutes: number };
type Result = { rating?: Rating; score?: number };
type Session = {
  role: Role;
  length: Length;
  rounds: Round[];
  results: Result[];
  notes: Record<string, string>;
  deadline: number;
  revealed: boolean;
};

const oralScore: Record<Rating, number> = { missed: 0, shaky: 50, solid: 100 };
const drill: Record<Area, string> = {
  Concepts: '/questions/practice?topic=Fundamentals',
  'Test design': '/problems?kind=testdesign',
  Automation: '/problems?kind=uilab',
  'Data/SQL': '/problems?kind=sql',
  Behavioral: '/questions/practice?type=Behavioral',
};

function questionArea(q: Question): Area {
  if (q.type === 'Behavioral') return 'Behavioral';
  if (q.topic === 'Test design techniques') return 'Test design';
  if (q.topic === 'SQL for testers' || q.topic === 'API testing') return 'Data/SQL';
  if (['Automation strategy and frameworks', 'Locators and waits', 'Flaky tests', 'Playwright', 'Selenium', 'CI/CD and Git'].includes(q.topic)) return 'Automation';
  return 'Concepts';
}

function itemArea(item: PracticeItem): Area {
  if (item.kind === 'sql' || (item.kind === 'mutation' && item.subject === 'api')) return 'Data/SQL';
  if (item.kind === 'testdesign' || item.kind === 'scenario' || item.kind === 'bughunt') return 'Test design';
  return 'Automation';
}

function createSession(role: Role, length: Length, seed: number): Session {
  let hash = seed | 0;
  function choose<T>(pool: T[]) {
    hash = Math.imul(1_664_525, hash) + 1_013_904_223;
    return pool[(hash >>> 0) % pool.length];
  }
  const rounds: Round[] = [];
  const used = new Set<string>();
  function addQuestion(type: Question['type'], preferred: Area) {
    const pool = QUESTIONS.filter((q) => q.type === type && !used.has(q.id));
    const rolePool = pool.filter((q) => q.roles.includes(role));
    const exact = rolePool.filter((q) => questionArea(q) === preferred);
    const question = choose(exact.length ? exact : rolePool.length ? rolePool : pool);
    if (!question) return;
    used.add(question.id);
    rounds.push({ id: question.id, type: 'question', area: questionArea(question), minutes: length === 'short' ? 3 : 4 });
  }
  function addItem(preferred: Area) {
    const pool = ITEMS.filter((item) => item.roles.includes(role) && !used.has(item.id));
    const exact = pool.filter((item) => itemArea(item) === preferred);
    const unseenArea = pool.filter((item) => !rounds.some((round) => round.area === itemArea(item)));
    const item = choose(exact.length ? exact : unseenArea.length ? unseenArea : pool);
    if (!item) return;
    used.add(item.id);
    rounds.push({ id: item.id, type: 'item', area: itemArea(item), minutes: length === 'short' ? 8 : 10 });
  }
  addQuestion('Concept', 'Concepts');
  addQuestion('Scenario', 'Test design');
  addItem('Automation');
  if (length === 'full') addQuestion('Tooling', 'Automation');
  addQuestion('Behavioral', 'Behavioral');
  if (length === 'full') addQuestion('Concept', 'Data/SQL');
  addItem('Data/SQL');
  if (length === 'full') addItem('Test design');

  return { role, length, rounds, results: [], notes: {}, deadline: seed + (rounds[0]?.minutes ?? 0) * 60_000, revealed: false };
}

function restore(): Session | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (!roles.includes(session.role) || !['short', 'full'].includes(session.length) ||
      !Array.isArray(session.rounds) || !session.rounds.length ||
      !Array.isArray(session.results) || session.results.length > session.rounds.length ||
      !session.notes || !Number.isFinite(session.deadline) || typeof session.revealed !== 'boolean' ||
      !session.rounds.every((round) =>
        areas.includes(round.area) && Number.isFinite(round.minutes) &&
        ((round.type === 'question' && QUESTION_BY_ID[round.id]) || (round.type === 'item' && ITEM_BY_ID[round.id])))) return null;
    return session;
  } catch {
    return null;
  }
}

function useSavedItem(id?: string) {
  const live = useStore((s) => id ? s.items[id] : undefined);
  const [disk, setDisk] = useState<State['items']>({});
  useEffect(() => {
    function read() {
      try {
        const raw = localStorage.getItem(PROGRESS_KEY);
        const saved = raw ? JSON.parse(raw) as Partial<State> : {};
        setDisk(saved.items ?? {});
      } catch {
        setDisk({});
      }
    }
    function onStorage(event: StorageEvent) {
      if (event.key === PROGRESS_KEY || event.key === null) read();
    }
    read();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', read);
    document.addEventListener('visibilitychange', read);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', read);
      document.removeEventListener('visibilitychange', read);
    };
  }, []);
  const saved = id ? disk[id] : undefined;
  return saved && (!live || saved.updatedAt > live.updatedAt) ? saved : live;
}

function savedScore(progress?: ItemProgress) {
  return progress?.best ?? (progress?.status === 'solved' ? 100 : undefined);
}

function Readiness({ session, onRestart }: { session: Session; onRestart: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  const scores = session.rounds.map((round, i) => {
    const { rating, score } = session.results[i];
    return { area: round.area, score: rating ? oralScore[rating] : score };
  });
  return (
    <section className="section pp-mock-summary" aria-labelledby="readiness">
      <h2 className="h2" id="readiness" tabIndex={-1} ref={heading}>Readiness by area</h2>
      <p className="small pp-secondary">Each score is the average of recorded rounds in that area. Missed counts as 0, Shaky as 50 and Solid as 100. Problems use the saved best score, which may be from an earlier attempt. A solve without a score counts as 100. Rounds without a score are excluded.</p>
      <ul className="pp-link-list pp-readiness">
        {areas.map((area) => {
          const marks = scores.flatMap((result) => result.area === area && result.score !== undefined ? [result.score] : []);
          const score = marks.length ? Math.round(marks.reduce((a, b) => a + b, 0) / marks.length) : null;
          return (
            <li className="pp-row" key={area}>
              <div><strong>{area}</strong><div className="caption num">{score === null ? 'No score' : `${score}% across ${marks.length} ${marks.length === 1 ? 'round' : 'rounds'}`}</div></div>
              {(score === null || score < 100) && <Link to={drill[area]}>Drill {area.toLowerCase()}</Link>}
            </li>
          );
        })}
      </ul>
      {!!Object.values(session.notes).some(Boolean) && (
        <details className="pp-notes-summary">
          <summary>Round notes</summary>
          {session.rounds.filter((r) => session.notes[r.id]).map((r) => (
            <div key={r.id}>
              <h3 className="h3">{r.type === 'question' ? QUESTION_BY_ID[r.id].question : ITEM_BY_ID[r.id].title}</h3>
              <p>{session.notes[r.id]}</p>
            </div>
          ))}
        </details>
      )}
      <button type="button" className="btn btn--primary pp-actions" onClick={onRestart}>New mock</button>
    </section>
  );
}

function ActiveRound({ session, round, patch, advance }: {
  session: Session;
  round: Round;
  patch: (state: Partial<Session>) => void;
  advance: (result: Result) => void;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRating = useRef<HTMLButtonElement>(null);
  const question = round.type === 'question' ? QUESTION_BY_ID[round.id] : undefined;
  const item = round.type === 'item' ? ITEM_BY_ID[round.id] : undefined;
  const progress = useSavedItem(item?.id);
  const score = savedScore(progress);

  useEffect(() => {
    heading.current?.focus();
  }, []);
  useEffect(() => {
    if (session.revealed) firstRating.current?.focus();
  }, [session.revealed]);

  return (
    <section className="panel panel-pad pp-round" aria-labelledby="mock-round">
      <div className="pp-row small">
        <span className="num">Round {session.results.length + 1} of {session.rounds.length} / {round.area}</span>
        {(!question || !session.revealed) && <Countdown deadline={session.deadline} />}
      </div>
      <h2 className="card-q" id="mock-round" tabIndex={-1} ref={heading}>{question?.question ?? item?.title}</h2>
      {question ? (
        <p className="small pp-secondary">Answer out loud, then compare and rate your response.</p>
      ) : item && (
        <>
          <p className="small pp-secondary">{KIND_INFO[item.kind].label} / {item.difficulty}. Submit in the problem tab, then return here.</p>
          <Link className="btn btn--primary" to={`/p/${item.id}`} target="_blank" rel="noreferrer">Open problem in new tab</Link>
          <p className="small pp-inline-note" role="status">
            {progress ? `${progress.status === 'solved' ? 'Solved' : 'Attempted'}${score === undefined ? '' : ` / best ${score}%`}` : 'No saved result'}
          </p>
        </>
      )}
      <label className="field pp-mock-notes">
        <span>Notes (optional)</span>
        <textarea className="textarea" rows={3} value={session.notes[round.id] ?? ''} onChange={(e) => patch({ notes: { ...session.notes, [round.id]: e.target.value } })} />
      </label>
      {question ? (
        session.revealed ? (
          <>
            <QuestionAnswer question={question} />
            <p className="small pp-secondary">How well did you answer?</p>
            <RateButtons first={firstRating} onRate={(rating) => advance({ rating })} />
          </>
        ) : <button className="btn btn--primary" onClick={() => patch({ revealed: true })}>Show answer</button>
      ) : (
        <button className="btn" onClick={() => advance({ score })}>
          {session.results.length + 1 === session.rounds.length ? 'Finish mock' : 'Next round'}
        </button>
      )}
    </section>
  );
}

export default function Mock() {
  const [session, setSession] = useState(restore);
  const [role, setRole] = useState<Role>(session?.role ?? 'manual');
  const [length, setLength] = useState<Length>(session?.length ?? 'short');
  const [storageBlocked, setStorageBlocked] = useState(false);
  const [confirmExit, setConfirmExit] = useState(false);
  const round = session?.rounds[session.results.length];

  function save(next: Session | null) {
    setSession(next);
    try {
      if (next) sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      else sessionStorage.removeItem(SESSION_KEY);
      setStorageBlocked(false);
    } catch {
      setStorageBlocked(true);
    }
  }

  function advance(result: Result) {
    if (!session || !round) return;
    const results = [...session.results, result];
    save({ ...session, results, deadline: Date.now() + (session.rounds[results.length]?.minutes ?? 0) * 60_000, revealed: false });
    setConfirmExit(false);
  }

  return (
    <div className="page page--narrow">
      <h1 className="h1">Mock interview</h1>
      {storageBlocked && <p className="notice">Tab storage is unavailable. Keep this page open to keep the mock.</p>}
      {!session ? (
        <>
          <p className="lede">Mix timed spoken answers with graded problems.</p>
          <form className="panel panel-pad pp-round pp-mock-form" onSubmit={(e) => { e.preventDefault(); save(createSession(role, length, Date.now())); }}>
            <label className="field"><span>Role</span><select className="select" aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {roles.map((r) => <option key={r} value={r}>{ROLE_INFO[r].label}</option>)}
            </select></label>
            <fieldset className="pp-fieldset">
              <legend className="small">Length</legend>
              <div className="btn-row pp-length-options">
                <label className="check"><input type="radio" name="length" checked={length === 'short'} onChange={() => setLength('short')} /> Short (25 min)</label>
                <label className="check"><input type="radio" name="length" checked={length === 'full'} onChange={() => setLength('full')} /> Full (50 min)</label>
              </div>
            </fieldset>
            <button className="btn btn--primary" type="submit">Start mock</button>
          </form>
        </>
      ) : !round ? (
        <Readiness session={session} onRestart={() => save(null)} />
      ) : (
        <>
          <p className="small pp-inline-note">{ROLE_INFO[session.role].label} / {session.length === 'short' ? 'Short' : 'Full'}</p>
          <ActiveRound key={round.id} session={session} round={round} patch={(next) => save({ ...session, ...next })} advance={advance} />
          {confirmExit ? (
            <div className="notice pp-actions">
              <p>Discard this mock? Its notes and ratings will be removed. Problem results will be kept.</p>
              <div className="btn-row">
                <button className="btn" onClick={() => setConfirmExit(false)}>Keep mock</button>
                <button className="btn" onClick={() => { setConfirmExit(false); save(null); }}>Discard mock</button>
              </div>
            </div>
          ) : <button className="btn btn--ghost pp-actions" onClick={() => setConfirmExit(true)}>Exit mock</button>}
        </>
      )}
    </div>
  );
}

