import { useRef, useState } from 'preact/hooks';
import type { CatalogProblem } from '../../lib/catalog';
import { progressStorageKey, type Kind } from '../../lib/contracts';
import { difficultyLabel, kindLabel } from '../../lib/labels';
import { bestScores, createProgressStore, notifyProgressChange } from '../../lib/progress';
import { calculateReadiness } from '../../lib/readiness';
import { dueIds } from '../../lib/review';
import { problemUrl, url } from '../../lib/url';
import { RoundReadiness, WeakTopics } from '../progress/ReadinessOverview';
import { reviewStorageKey, useStudySnapshot } from '../progress/useStudySnapshot';

const kinds = Object.keys(kindLabel) as Kind[];
const difficulties = Object.keys(difficultyLabel) as CatalogProblem['difficulty'][];
const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });
const scoreFormat = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 });
const storageMessage = 'Progress could not be saved. Check your browser’s storage settings and try again.';

export default function ProgressDashboard({ problems, questionIds }: { problems: CatalogProblem[]; questionIds: string[] }) {
  const snapshot = useStudySnapshot();
  const loaded = snapshot !== null;
  const attempts = snapshot?.attempts ?? [];
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);

  function exportProgress() {
    try {
      const json = createProgressStore(window.localStorage).exportJson();
      const downloadUrl = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'pom-proof-progress.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setMessage('Progress exported.');
    } catch {
      setMessage('Could not export progress. Check your browser’s storage settings and try again.');
    }
  }

  async function importProgress(file: File) {
    let json: string;
    try {
      json = await file.text();
    } catch {
      setMessage('Could not read the file. Choose another file.');
      return;
    }
    try {
      const imported = createProgressStore(window.localStorage).importJson(json);
      if (!imported.ok) {
        setMessage(imported.message);
        return;
      }
      const count = imported.snapshot.attempts.length;
      const attemptsText = `${count} ${count === 1 ? 'attempt' : 'attempts'}`;
      const sets = imported.sets;
      notifyProgressChange();
      setMessage(sets === undefined
        ? `Imported ${attemptsText}.`
        : `Imported ${attemptsText} and ${sets} ${sets === 1 ? 'practice set' : 'practice sets'}.`);
    } catch {
      setMessage(storageMessage);
    }
  }

  function resetProgress() {
    resetDialog.current?.close();
    try {
      window.localStorage.removeItem(progressStorageKey);
      window.localStorage.removeItem(reviewStorageKey);
      notifyProgressChange();
      setMessage('Progress reset.');
    } catch {
      setMessage(storageMessage);
    }
  }

  const catalogue = new Map(problems.map((problem) => [problem.id, problem]));
  const scores = bestScores(attempts);
  const solved = problems.filter(({ id }) => scores.get(id) === 1);
  const recent = attempts.slice().reverse().sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
  const { rounds, questions, needsPractice, unattempted } =
    calculateReadiness(attempts, snapshot?.cards ?? {}, { problems, questionIds });
  const queue = snapshot ? dueIds(questionIds) : [];
  const due = snapshot ? queue.filter((id) => Object.hasOwn(snapshot.cards, id)).length : 0;
  const unseen = queue.length - due;
  const counts = (rows: CatalogProblem[]) =>
    difficulties.map((difficulty) => rows.filter((problem) => problem.difficulty === difficulty).length);

  return (
    <div class="progress-dashboard">
      <dl class="progress-totals">
        <div class="progress-tile" data-card>
          <dt class="section-label">Problems</dt>
          <dd class="num"><strong>{solved.length}</strong> of {problems.length} solved</dd>
        </div>
        <div class="progress-tile" data-card>
          <dt class="section-label">Due for review</dt>
          <dd class="num"><strong>{loaded ? due : '–'}</strong></dd>
        </div>
        <div class="progress-tile" data-card>
          <dt class="section-label">Attempts</dt>
          <dd class="num"><strong>{attempts.length}</strong></dd>
        </div>
      </dl>
      <section class="callout review-overview" data-card aria-labelledby="review-heading">
        <div>
          <h2 id="review-heading">Review queue</h2>
          {loaded && <p class="muted num">{due} due for review, {unseen} new</p>}
        </div>
        <a class="button outline" href={url('/questions/#review')}>Start review</a>
      </section>
      <div class="progress-layout">
        <RoundReadiness rounds={rounds} questions={questions} loaded={loaded} />
        <div class="progress-rail">
          <WeakTopics needsPractice={needsPractice} unattempted={unattempted} hasProblems={problems.length > 0} loaded={loaded} />
          <section class="progress-section" data-card aria-labelledby="saved-heading">
            <h2 id="saved-heading">Saved progress</h2>
            <div class="progress-actions" aria-label="Progress data" role="group">
              <button class="button outline" type="button" disabled={!loaded} onClick={exportProgress}>Export</button>
              <button class="button outline" type="button" disabled={!loaded} onClick={() => fileInput.current?.click()}>Import</button>
              <input ref={fileInput} type="file" accept=".json,application/json" hidden aria-label="Choose progress file"
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  event.currentTarget.value = '';
                  if (file) void importProgress(file);
                }} />
              <button class="button danger" type="button" disabled={!loaded} onClick={() => resetDialog.current?.showModal()}>Reset</button>
            </div>
            <p class="muted">This browser saves your progress. Importing a file replaces your attempts. If the file includes question ratings or practice sets, it replaces those too.</p>
            <p class="progress-message" role="status">{message}</p>
          </section>
        </div>
      </div>
      <dialog ref={resetDialog} class="reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-description">
        <h2 id="reset-title">Reset progress?</h2>
        <p id="reset-description">Reset deletes all attempts and question ratings in this browser. It does not delete exported files. Practice sets stay.</p>
        <div class="progress-actions">
          <button class="button outline" type="button" autoFocus onClick={() => resetDialog.current?.close()}>Keep progress</button>
          <button class="button danger" type="button" onClick={resetProgress}>Reset progress</button>
        </div>
      </dialog>
      <section class="progress-section progress-table-section" data-card aria-labelledby="attempts-heading">
        <header class="progress-section-heading">
          <h2 id="attempts-heading">Recent attempts</h2>
          {recent.length === 0 && <p class="muted">No attempts yet</p>}
        </header>
        {recent.length > 0 && (
          <table class="attempts-table" aria-label="Recent attempts">
            <thead>
              <tr><th scope="col">Problem</th><th scope="col">Score</th><th scope="col">Submitted</th></tr>
            </thead>
            <tbody>
              {recent.map(({ problemId, completedAt, score }, index) => {
                const problem = catalogue.get(problemId);
                return (
                  <tr key={index}>
                    <td>{problem ? <a href={problemUrl(problemId)}>{problem.title}</a> : problemId}</td>
                    <td>{scoreFormat.format(score)}</td>
                    <td><time dateTime={new Date(completedAt).toISOString()}>{dateFormat.format(new Date(completedAt))}</time></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
      <section class="progress-section progress-table-section" data-card aria-labelledby="solved-heading">
        <header class="progress-section-heading"><h2 id="solved-heading">Solved problems</h2></header>
        <table class="solved-table" aria-label="Solved by kind and difficulty">
          <thead>
            <tr>
              <th scope="col">Kind</th>
              {difficulties.map((difficulty) => <th scope="col" key={difficulty}>{difficultyLabel[difficulty]}</th>)}
              <th scope="col">Total</th>
            </tr>
          </thead>
          <tbody>
            {kinds.map((kind) => {
              const rows = solved.filter((problem) => problem.kind === kind);
              return (
                <tr key={kind}>
                  <th scope="row">{kindLabel[kind]}</th>
                  {counts(rows).map((count, index) => <td key={difficulties[index]}>{count}</td>)}
                  <td>{rows.length}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr>
              <th scope="row">Total</th>
              {counts(solved).map((count, index) => <td key={difficulties[index]}>{count}</td>)}
              <td>{solved.length}</td>
            </tr>
          </tfoot>
        </table>
      </section>
    </div>
  );
}
