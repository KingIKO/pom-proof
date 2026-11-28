import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import type { PracticeSet, PracticeSets } from '../../lib/practice-sets';

export type SetResult = { ok: true; message: string } | { ok: false; message: string; field?: true };
type SetMode = 'save' | 'rename' | 'delete' | null;

interface SetRowProps {
  sets: PracticeSets;
  /** The set this tab shows or edits. */
  selected: PracticeSet | undefined;
  /** Filters are on and differ from the selected set's. */
  changed: boolean;
  filtersOn: boolean;
  /** The selected set's saved filters name nothing the list still offers. */
  retired: boolean;
  /** The name a new set starts with: the filters' own label. */
  suggestedName: string;
  /** The status line's text, kept by the list so the row stays while it shows. */
  status: string;
  announce(message: string): void;
  choose(id: string | null): void;
  save(name: string): SetResult;
  update(): SetResult;
  rename(name: string): SetResult;
  remove(): SetResult;
  /** Moves focus to the filters when the row has no control left to hold it. */
  focusFilters(): void;
}

/**
 * The practice set row above the filters: the picker, then the actions that fit the current state.
 * Every control is outline or text, so Continue stays the page's one filled button.
 */
export default function PracticeSetRow(props: SetRowProps) {
  const { sets, selected, changed, filtersOn, retired, suggestedName, status, announce, choose, save, update, rename, remove, focusFilters } = props;
  const [mode, setMode] = useState<SetMode>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  // Counts refused submits, so the alert is a new element and is read again for a repeated error.
  const [errorCount, setErrorCount] = useState(0);
  const [focus, setFocus] = useState<string | null>(null);
  const row = useRef<HTMLDivElement>(null);

  // Focus moves in the render that shows its target, before paint, so it never rests on the page
  // body when a form closes. It falls back to the picker, then Save as set, then the filters.
  useLayoutEffect(() => {
    if (!focus || !row.current) return;
    // `name-error` focuses the name field and keeps the cursor where the learner left it.
    const key = focus === 'name-error' ? 'name' : focus;
    const target = [key, 'picker', 'save']
      .map((value) => row.current!.querySelector<HTMLElement>(`[data-set-focus="${value}"]`))
      .find(Boolean);
    setFocus(null);
    if (!target) return focusFilters();
    target.focus();
    if (focus === 'name' && target instanceof HTMLInputElement) target.select();
  }, [focus]);

  // A form for a set that another tab deleted, or a save form whose filters were cleared, closes.
  // Focus that was in the closing form moves to the picker.
  useEffect(() => {
    const gone = (mode === 'rename' || mode === 'delete') && !selected;
    if (!gone && !(mode === 'save' && !filtersOn)) return;
    if (row.current?.contains(document.activeElement)) setFocus('picker');
    setMode(null);
    setError('');
  }, [mode, selected, filtersOn]);

  function open(next: Exclude<SetMode, null>) {
    setMode(next);
    setError('');
    announce('');
    setName(next === 'rename' ? selected?.name ?? '' : suggestedName);
    setFocus(next === 'delete' ? 'keep' : 'name');
  }

  function close(focusOn: string) {
    setMode(null);
    setError('');
    setFocus(focusOn);
  }

  function finish(result: SetResult, focusOn: string) {
    if (!result.ok && result.field) {
      setError(result.message);
      setErrorCount((count) => count + 1);
      setFocus('name-error');
      return;
    }
    announce(result.message);
    if (result.ok) close(focusOn);
  }

  function submit(event: Event) {
    event.preventDefault();
    finish(mode === 'rename' ? rename(name) : save(name), mode === 'rename' ? 'rename' : 'picker');
  }

  const formOpener = mode === 'rename' ? 'rename' : selected ? 'save-new' : 'save';
  const value = selected ? `set:${selected.id}` : filtersOn ? 'unsaved' : 'all';
  const errorId = 'practice-set-name-error';

  return (
    <div class="practice-sets" ref={row} role="group" aria-label="Practice sets">
      {sets.sets.length > 0 && (
        <>
          <label class="section-label" for="practice-set">Practice set</label>
          <span class="select-field">
            <select class="input" id="practice-set" name="practice-set" data-set-focus="picker" value={value}
              onChange={({ currentTarget }) => {
                const chosen = currentTarget.value;
                setMode(null);
                announce('');
                choose(chosen.startsWith('set:') ? chosen.slice(4) : null);
              }}>
              <option value="all">All problems</option>
              {value === 'unsaved' && <option value="unsaved" disabled>Unsaved filters</option>}
              {sets.sets.map((set) => <option key={set.id} value={`set:${set.id}`}>{set.name}</option>)}
            </select>
            <span class="chevron" aria-hidden="true" />
          </span>
        </>
      )}
      {selected && retired && mode === null && <p class="set-note">This set’s topics are no longer in Practice.</p>}
      {mode === null && (filtersOn || selected) && (
        <div class="set-actions">
          {filtersOn && !selected && (
            <button type="button" class="button outline" data-set-focus="save" onClick={() => open('save')}>Save as set</button>
          )}
          {selected && changed && (
            <>
              <button type="button" class="button outline" data-set-focus="update"
                onClick={() => finish(update(), 'picker')}>Update set</button>
              <button type="button" class="button outline" data-set-focus="save-new" onClick={() => open('save')}>Save as new set</button>
            </>
          )}
          {selected && (
            <>
              <button type="button" class="button quiet" data-set-focus="rename" onClick={() => open('rename')}>Rename</button>
              <button type="button" class="button quiet" data-set-focus="delete" onClick={() => open('delete')}>Delete</button>
            </>
          )}
        </div>
      )}
      {(mode === 'save' || mode === 'rename') && (
        <form class="set-form" onSubmit={submit} onKeyDown={(event) => {
          if (event.key === 'Escape') close(formOpener);
        }}>
          <label class="set-label" for="practice-set-name">Set name</label>
          <input class="input" id="practice-set-name" name="set-name" type="text" autocomplete="off" enterKeyHint="done" data-set-focus="name"
            value={name} aria-invalid={error ? 'true' : undefined} aria-describedby={error ? errorId : undefined}
            onInput={({ currentTarget }) => setName(currentTarget.value)} />
          {error && <p class="set-error" id={errorId} role="alert" key={errorCount}>{error}</p>}
          <div class="set-actions">
            <button type="submit" class="button outline">{mode === 'rename' ? 'Rename set' : 'Save set'}</button>
            <button type="button" class="button quiet" onClick={() => close(formOpener)}>Cancel</button>
          </div>
        </form>
      )}
      {mode === 'delete' && selected && (
        <div class="set-confirm" role="group" aria-labelledby="practice-set-delete" onKeyDown={(event) => {
          if (event.key === 'Escape') close('delete');
        }}>
          <p id="practice-set-delete">Delete “{selected.name}”? Your progress stays.</p>
          <div class="set-actions">
            <button type="button" class="button danger" onClick={() => finish(remove(), 'picker')}>Delete set</button>
            <button type="button" class="button outline" data-set-focus="keep" onClick={() => close('delete')}>Keep set</button>
          </div>
        </div>
      )}
      <p class="set-status" role="status">{status}</p>
    </div>
  );
}
