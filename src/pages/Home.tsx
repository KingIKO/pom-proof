import { Link } from 'react-router-dom';
import { StatusIcon } from '../components/Icons';
import { dailySet, ITEMS, QUESTIONS } from '../content';
import { KIND_INFO, KIND_ORDER } from '../content/kinds';
import { useStore, type State } from '../lib/store';
import './pages.css';

const DAY = 86_400_000;
const dateKey = (time: number) => new Date(time).toISOString().slice(0, 10);

export function ActivityHeat({ activity }: { activity: State['activity'] }) {
  const now = new Date();
  const today = now.setUTCHours(0, 0, 0, 0);
  const currentDay = (now.getUTCDay() + 6) % 7;
  const start = today - (17 * 7 + currentDay) * DAY;
  const days = Array.from({ length: 18 * 7 }, (_, i) => start + i * DAY);
  let streak = 0;
  const streakEnd = activity[dateKey(today)] ? today : today - DAY;
  while (activity[dateKey(streakEnd - streak * DAY)] > 0) streak++;
  const active = days.filter((day) => day <= today && activity[dateKey(day)] > 0).length;

  return (
    <figure className="pp-activity">
      <figcaption className="small num">
        {streak} {streak === 1 ? 'day' : 'days'} in a row <span aria-hidden="true">/</span> {active} active days in 18 weeks
      </figcaption>
      <div className="pp-heat-scroll">
        <div className="heat" aria-hidden="true">
          {days.map((day) => {
            const key = dateKey(day);
            const n = activity[key] ?? 0;
            return day > today
              ? <span key={key} className="pp-heat-future" />
              : <span key={key} data-l={n >= 5 ? 3 : n >= 2 ? 2 : n} title={`${key}: ${n} ${n === 1 ? 'activity' : 'activities'}`} />;
          })}
        </div>
      </div>
    </figure>
  );
}

export function Home() {
  const items = useStore((s) => s.items);
  const cards = useStore((s) => s.cards);
  const activity = useStore((s) => s.activity);
  const daily = dailySet();
  const solved = ITEMS.filter((i) => items[i.id]?.status === 'solved').length;
  const due = QUESTIONS.filter((q) => cards[q.id] && cards[q.id].due <= Date.now()).length;
  const dailySolved = daily.items.filter((i) => items[i.id]?.status === 'solved').length;
  const dailyReviewed = daily.questions.filter((q) => cards[q.id]).length;

  return (
    <div className="page pp-home">
      <header className="hero">
        <h1 className="h1">Graded practice for QA, automation and SDET interviews</h1>
        <div className="btn-row pp-actions">
          <Link className="btn btn--primary btn--lg" to="/problems">Start practice</Link>
          <Link className="pp-text-link" to="/tracks">Browse study plans</Link>
        </div>
      </header>

      <section className="section" aria-labelledby="daily-heading">
        <div className="section-head pp-section-head">
          <h2 className="h2" id="daily-heading">Daily set</h2>
          <time className="caption num" dateTime={daily.key}>{daily.key} UTC</time>
        </div>
        {!daily.items.length && !daily.questions.length ? (
          <p className="notice">No daily set yet. Browse the study plans to get started.</p>
        ) : (
          <div className="grid-2">
            {daily.items.length > 0 && (
              <div className="panel panel-pad">
                <div className="pp-row">
                  <h3 className="h3">Problems</h3>
                  <span className="caption num">{dailySolved} of {daily.items.length} solved</span>
                </div>
                <ul className="pp-link-list pp-daily-list">
                  {daily.items.map((i) => (
                    <li key={i.id}>
                      <StatusIcon status={items[i.id]?.status} />
                      <Link to={`/p/${i.id}`}>{i.title}</Link>
                      <span className={`diff diff--${i.difficulty}`}>{i.difficulty}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {daily.questions.length > 0 && (
              <div className="panel panel-pad">
                <div className="pp-row">
                  <h3 className="h3">Flashcards</h3>
                  <span className="caption num">{dailyReviewed} of {daily.questions.length} seen before</span>
                </div>
                <p className="small pp-secondary">Say each answer out loud, then compare it with the model answer.</p>
                <Link to="/questions/practice?daily=1">Review daily cards</Link>
              </div>
            )}
          </div>
        )}
        <p className="small pp-inline-note">
          {due > 0 ? <Link to="/questions/practice?due=1">{due} {due === 1 ? 'card' : 'cards'} due for review</Link> : '0 cards due for review'}
        </p>
      </section>

      <section className="section" aria-labelledby="rounds-heading">
        <div className="section-head"><h2 className="h2" id="rounds-heading">Kinds of rounds</h2></div>
        <div className="grid-3">
          {KIND_ORDER.map((kind) => (
            <Link className="lab-link" key={kind} to={`/problems?kind=${kind}`}>
              <h3 className="h3">{KIND_INFO[kind].plural}<span className="caption num">{ITEMS.filter((i) => i.kind === kind).length}</span></h3>
              <p>{KIND_INFO[kind].blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {Object.keys(activity).length > 0 && (
        <section className="section" aria-labelledby="home-progress-heading">
          <div className="section-head pp-section-head">
            <h2 className="h2" id="home-progress-heading">Your progress</h2>
            <Link to="/progress" className="small">View progress</Link>
          </div>
          <p className="num">{solved} of {ITEMS.length} problems solved</p>
          <ActivityHeat activity={activity} />
        </section>
      )}

      <footer className="pp-footer caption">
        <Link to="/progress">Progress</Link>
        <Link to="/about">About POM Proof</Link>
      </footer>
    </div>
  );
}

