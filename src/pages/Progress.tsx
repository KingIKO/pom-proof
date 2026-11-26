import { useState, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { ITEMS, QUESTIONS } from '../content';
import { KIND_INFO, KIND_ORDER } from '../content/kinds';
import type { Difficulty } from '../content/types';
import { exportProgress, importProgress, resetProgress, useStore } from '../lib/store';
import { ActivityHeat } from './Home';
import './pages.css';

const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard'];
const boxes = [0, 1, 2, 3, 4];

function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function natural(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

function oneOf<T extends string>(value: unknown, choices: readonly T[]) {
  return typeof value === 'string' && choices.some((choice) => choice === value);
}

function validProgress(json: string) {
  const parsed: unknown = JSON.parse(json);
  if (!record(parsed)) return false;
  const { version, items, cards, drafts, activity, prefs } = parsed;
  return version === 1 && record(items) && record(cards) && record(drafts) && record(activity) && record(prefs) &&
    Object.values(items).every((item) => record(item) && oneOf(item.status, ['attempted', 'solved']) && natural(item.updatedAt) &&
      (item.best === undefined || (typeof item.best === 'number' && item.best >= 0 && item.best <= 100))) &&
    Object.values(cards).every((card) => record(card) && natural(card.box) && card.box <= 4 && natural(card.due) &&
      natural(card.seen) && card.seen > 0 && oneOf(card.last, ['missed', 'shaky', 'solid'])) &&
    Object.values(drafts).every((draft) => typeof draft === 'string') &&
    Object.entries(activity).every(([day, count]) => /^\d{4}-\d{2}-\d{2}$/.test(day) && natural(count)) &&
    oneOf(prefs.lang, ['javascript', 'typescript', 'python']) && oneOf(prefs.theme, ['system', 'light', 'dark']);
}

function downloadProgress() {
  const download = document.createElement('a');
  const url = URL.createObjectURL(new Blob([exportProgress()], { type: 'application/json' }));
  download.href = url;
  download.download = `pom-proof-progress-${new Date().toISOString().slice(0, 10)}.json`;
  download.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function Progress() {
  const items = useStore((s) => s.items);
  const cards = useStore((s) => s.cards);
  const activity = useStore((s) => s.activity);
  const [confirmReset, setConfirmReset] = useState(false);
  const [pending, setPending] = useState<{ name: string; json: string } | null>(null);
  const [message, setMessage] = useState<{ text: string; error?: boolean }>();
  const solved = ITEMS.filter((item) => items[item.id]?.status === 'solved');
  const seen = QUESTIONS.flatMap((question) => cards[question.id] ? [cards[question.id]] : []);
  const count = (bank: typeof ITEMS, difficulty: Difficulty) => bank.filter((item) => item.difficulty === difficulty).length;

  async function selectImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setMessage(undefined);
    setConfirmReset(false);
    setPending(null);
    try {
      const json = await file.text();
      if (!validProgress(json)) throw new Error();
      setPending({ name: file.name, json });
    } catch {
      setMessage({ text: 'This file is not a POM Proof progress export; choose an exported JSON file.', error: true });
    }
  }

  function applyImport() {
    if (!pending) return;
    try {
      importProgress(pending.json);
      setMessage({ text: 'Progress imported.' });
    } catch {
      setMessage({ text: 'Progress could not be imported; the current progress was kept.', error: true });
    }
    setPending(null);
  }

  return (
    <div className="page page--narrow">
      <h1 className="h1">Progress</h1>
      <p className="lede">Problems solved, flashcards rated and activity in this browser.</p>
      <div className="stat-row pp-actions">
        <div className="stat"><div className="v">{solved.length} / {ITEMS.length}</div><div className="l">Problems solved</div></div>
        <div className="stat"><div className="v">{seen.length} / {QUESTIONS.length}</div><div className="l">Flashcards rated</div></div>
      </div>
      {!solved.length && !seen.length && (
        <p className="small pp-inline-note">No solves or ratings yet. <Link to="/problems">Start a problem</Link> or <Link to="/questions/practice">review flashcards</Link>.</p>
      )}
      <section className="section" aria-labelledby="solve-heading">
        <div className="section-head"><h2 className="h2" id="solve-heading">Problems solved</h2></div>
        <div className="pp-table-scroll">
          <table className="table pp-progress-table">
            <thead><tr><th scope="col">Kind</th>{difficulties.map((d) => <th scope="col" key={d}>{d}</th>)}<th scope="col">Total</th></tr></thead>
            <tbody>
              {KIND_ORDER.map((kind) => {
                const ofKind = ITEMS.filter((item) => item.kind === kind);
                const solvedKind = solved.filter((item) => item.kind === kind);
                return (
                  <tr key={kind}>
                    <th scope="row"><Link to={`/problems?kind=${kind}`}>{KIND_INFO[kind].plural}</Link></th>
                    {difficulties.map((d) => <td key={d} className="num">{count(solvedKind, d)}/{count(ofKind, d)}</td>)}
                    <td className="num">{solvedKind.length}/{ofKind.length}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot><tr><th scope="row">All kinds</th>{difficulties.map((d) => <td key={d} className="num">{count(solved, d)}/{count(ITEMS, d)}</td>)}<td className="num">{solved.length}/{ITEMS.length}</td></tr></tfoot>
          </table>
        </div>
      </section>
      <section className="section" aria-labelledby="boxes-heading">
        <div className="section-head pp-section-head">
          <h2 className="h2" id="boxes-heading">Flashcard boxes</h2>
          <Link to="/questions/practice" className="small">Review cards</Link>
        </div>
        <p className="small pp-secondary">Higher boxes are scheduled further apart. Missed cards return to box 0.</p>
        <div className="stat-row">
          {boxes.map((box) => <div className="stat" key={box}><div className="v">{seen.filter((card) => card.box === box).length}</div><div className="l">Box {box}</div></div>)}
        </div>
      </section>
      <section className="section" aria-labelledby="activity-heading">
        <div className="section-head"><h2 className="h2" id="activity-heading">Activity</h2></div>
        <ActivityHeat activity={activity} />
      </section>
      <section className="section" aria-labelledby="files-heading">
        <div className="section-head"><h2 className="h2" id="files-heading">Progress file</h2></div>
        <p className="small pp-secondary">The file includes saved results, drafts, activity and preferences. Mock notes stay in the tab and are excluded.</p>
        <div className="btn-row">
          <button className="btn btn--primary" onClick={downloadProgress}>Export progress</button>
          <label className="btn pp-file-input">
            Import progress
            <input type="file" aria-label="Import progress" accept=".json,application/json" onChange={selectImport} className="sr-only" />
          </label>
          <button className="btn btn--ghost" onClick={() => { setConfirmReset(true); setPending(null); setMessage(undefined); }}>Reset progress</button>
        </div>
        {pending && (
          <div className="notice pp-actions">
            <p>Replace local progress with <strong>{pending.name}</strong>? This replaces results, drafts, activity and preferences.</p>
            <div className="btn-row">
              <button className="btn btn--primary" onClick={applyImport}>Replace progress</button>
              <button className="btn" onClick={() => setPending(null)}>Cancel</button>
            </div>
          </div>
        )}
        {confirmReset && (
          <div className="notice pp-actions">
            <p>Reset local progress? This removes results, drafts, activity and preferences. Exported files and the current mock are kept.</p>
            <div className="btn-row">
              <button className="btn" onClick={() => setConfirmReset(false)}>Keep progress</button>
              <button className="btn" onClick={() => { resetProgress(); setConfirmReset(false); setMessage({ text: 'Progress reset.' }); }}>Confirm reset</button>
            </div>
          </div>
        )}
        {message && <p className={`notice pp-actions ${message.error ? 'notice--bad' : 'notice--ok'}`} role={message.error ? 'alert' : 'status'}>{message.text}</p>}
      </section>
    </div>
  );
}

