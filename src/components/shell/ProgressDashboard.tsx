import { useEffect, useRef, useState } from 'preact/hooks';
import type { CatalogProblem } from '../../lib/catalog';
import { progressStorageKey, type Kind, type ProgressAttempt } from '../../lib/contracts';
import { difficultyLabel, kindLabel } from '../../lib/labels';
import { bestScores, createProgressStore, notifyProgressChange, onProgressChange, readProgress } from '../../lib/progress';
import { problemUrl } from '../../lib/url';
import { reviewStorageKey } from '../progress/useStudySnapshot';

const kinds = Object.keys(kindLabel) as Kind[];
const difficulties = Object.keys(difficultyLabel) as CatalogProblem['difficulty'][];
const dateFormat = new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' });
const scoreFormat = new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 });
const storageMessage = 'Progress could not be saved; check this browser’s storage settings and try again.';

export default function ProgressDashboard({ problems }: { problems: CatalogProblem[] }) {
  const [storedAttempts, setAttempts] = useState<ProgressAttempt[] | null>(null);
  const attempts = storedAttempts ?? [];
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const update = () => setAttempts(readProgress().attempts);
    update();
    const unsubscribe = onProgressChange(update);
    window.addEventListener('pageshow', update);
    return () => {
      unsubscribe();
      window.removeEventListener('pageshow', update);
    };
  }, []);

  function exportProgress() {
    try {
      const json = createProgressStore(window.localStorage).exportJson();
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pom-proof-progress.json';
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
      setMessage('Progress exported.');
    } catch {
      setMessage('Progress could not be exported; check this browser’s storage settings and try again.');
    }
  }

  async function importProgress(file: File) {
    let json: string;
    try {
      json = await file.text();
    } catch {
      setMessage('The file could not be read; choose another file.');
      return;
    }
    try {
      const imported = createProgressStore(window.localStorage).importJson(json);
      if (!imported.ok) {
        setMessage(imported.message);
        return;
      }
      const count = imported.snapshot.attempts.length;
      notifyProgressChange();
      setMessage(`Imported ${count} ${count === 1 ? 'attempt' : 'attempts'}.`);
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
  const counts = (rows: CatalogProblem[]) =>
    difficulties.map((difficulty) => rows.filter((problem) => problem.difficulty === difficulty).length);

  return (
    <>
      <div class="progress-actions" aria-label="Progress data" role="group">
        <button type="button" disabled={storedAttempts === null} onClick={exportProgress}>Export</button>
        <button type="button" disabled={storedAttempts === null} onClick={() => fileInput.current?.click()}>Import</button>
        <input ref={fileInput} type="file" accept=".json,application/json" hidden aria-label="Choose progress file"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            event.currentTarget.value = '';
            if (file) void importProgress(file);
          }} />
        <button type="button" disabled={storedAttempts === null} onClick={() => resetDialog.current?.showModal()}>Reset</button>
      </div>
      <p class="muted progress-note">Progress is stored in this browser. Import replaces attempts and any question ratings included in the file.</p>
      <p class="progress-message" role="status">{message}</p>
      <dialog ref={resetDialog} class="reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-description">
        <h2 id="reset-title">Reset progress?</h2>
        <p id="reset-description">This deletes all attempts and question ratings in this browser. Exported files are kept.</p>
        <div class="progress-actions">
          <button type="button" autoFocus onClick={() => resetDialog.current?.close()}>Keep progress</button>
          <button type="button" onClick={resetProgress}>Reset progress</button>
        </div>
      </dialog>
      <section class="progress-section" aria-labelledby="solved-heading">
        <h2 id="solved-heading">Solved problems</h2>
        <p class="progress-total">{solved.length} of {problems.length} solved</p>
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
      <section class="progress-section" aria-labelledby="attempts-heading">
        <h2 id="attempts-heading">Recent attempts</h2>
        {recent.length === 0 ? <p class="muted">No attempts yet</p> : (
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
    </>
  );
}
