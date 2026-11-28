import { formatDay, onStudyChange, readStudy, setRead, type ReadMap } from './read-state';

const idsOf = (element: HTMLElement) => (element.dataset.ids ?? '').split(' ').filter(Boolean);

/** Fills every read mark, count and Start link on the page from the stored marks. */
function paint(read: ReadMap) {
  for (const mark of document.querySelectorAll<HTMLElement>('[data-study-status]')) {
    const done = (mark.dataset.studyStatus ?? '') in read;
    mark.textContent = done ? 'Read' : '';
    mark.classList.toggle('pass', done);
  }
  for (const count of document.querySelectorAll<HTMLElement>('[data-study-count]')) {
    const ids = idsOf(count);
    const done = ids.filter((id) => id in read).length;
    count.textContent = `${done} of ${ids.length} read`;
    count.hidden = done === 0;
  }
  for (const start of document.querySelectorAll<HTMLAnchorElement>('a[data-study-start]')) {
    const ids = idsOf(start);
    const next = ids.find((id) => !(id in read));
    const finished = start.parentElement?.querySelector<HTMLElement>('[data-study-finished]');
    start.hidden = !next;
    if (finished) finished.hidden = Boolean(next);
    if (next) {
      start.href = `${start.dataset.base ?? ''}${next}/`;
      start.textContent = ids.some((id) => id in read) ? 'Continue' : 'Start here';
    }
  }
}

/** Keeps the read marks on the page in step with this tab and any other. */
export function setupReadMarks() {
  paint(readStudy());
  onStudyChange(() => paint(readStudy()));
}

/** The page's Mark as read control: the one filled button, then "Read on <day>" with Mark as unread. */
export function setupReadToggle() {
  const control = document.querySelector<HTMLElement>('[data-study-read-control]');
  const id = control?.dataset.studyId;
  if (!control || !id) return;
  const mark = control.querySelector<HTMLButtonElement>('[data-study-mark]');
  const unread = control.querySelector<HTMLElement>('[data-study-unread]');
  const done = control.querySelector<HTMLElement>('[data-study-done]');
  const day = control.querySelector<HTMLElement>('[data-study-day]');
  const unmark = control.querySelector<HTMLButtonElement>('[data-study-unmark]');
  const status = control.querySelector<HTMLElement>('[data-study-announce]');
  const error = control.querySelector<HTMLElement>('[data-study-error]');
  if (!mark || !unread || !done || !day || !unmark || !status || !error) return;

  const show = () => {
    const date = readStudy()[id];
    unread.hidden = Boolean(date);
    done.hidden = !date;
    if (date) day.textContent = `Read on ${formatDay(date, new Date().getFullYear())}`;
  };
  const toggle = (read: boolean) => {
    error.hidden = true;
    try {
      setRead(id, read);
    } catch {
      error.textContent = 'The browser could not save this. Check its storage settings and try again.';
      error.hidden = false;
      return;
    }
    show();
    status.textContent = read ? 'Marked as read.' : 'Marked as unread.';
    (read ? unmark : mark).focus();
  };

  mark.addEventListener('click', () => toggle(true));
  unmark.addEventListener('click', () => toggle(false));
  onStudyChange(show);
  show();
  control.hidden = false;
}

/** The module list is one disclosure on narrow screens, closed at first, and always open from 60rem. */
export function setupNavDisclosure() {
  const disclosure = document.querySelector<HTMLDetailsElement>('details[data-study-nav]');
  if (!disclosure) return;
  const wide = window.matchMedia('(min-width: 60rem)');
  const sync = () => {
    disclosure.open = wide.matches;
  };
  sync();
  wide.addEventListener('change', sync);
}
