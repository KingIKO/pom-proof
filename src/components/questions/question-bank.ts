import { dueIds, rate, reviewSnapshot, type CardState, type Rating } from '../../lib/review';
import { setupCodeExamples } from './code-examples';
import {
  filterParams, questionFragmentUrl, questionLevels, questionListUrl, questionRoles, questionSearchUrl,
  questionTopics, questionTypes, questionUrl, ratings, startSession, withParams,
} from './questions';

const facets = { role: questionRoles, topic: questionTopics, level: questionLevels, type: questionTypes };
type Facet = keyof typeof facets;
const facetNames = Object.keys(facets) as Facet[];
const relativeTime = new Intl.RelativeTimeFormat('en');
type SearchIndex = Record<string, string>;
type MountedAnswer = {
  feedback: HTMLElement;
  ratingButtons: NodeListOf<HTMLButtonElement>;
};

function nextReviewLabel(due: string, reviewedAt: Date) {
  const minutes = Math.round((Date.parse(due) - reviewedAt.getTime()) / 60_000);
  if (minutes <= 0) return 'Next review due now.';
  const minutesPerDay = 24 * 60;
  const delay = minutes < minutesPerDay
    ? relativeTime.format(minutes, 'minute')
    : relativeTime.format(Math.round(minutes / minutesPerDay), 'day');
  return `Next review ${delay}.`;
}

function searchTerms(params: URLSearchParams) {
  return (params.get('q') ?? '').toLowerCase().trim().split(/\s+/).filter(Boolean);
}

function readFilters() {
  const params = filterParams(new URLSearchParams(window.location.search));
  for (const key of facetNames) {
    if (!Object.hasOwn(facets[key], params.get(key) ?? '')) params.delete(key);
  }
  return params;
}

function withFilter(params: URLSearchParams, key: Facet, value: string) {
  const next = new URLSearchParams(params);
  if (value) next.set(key, value);
  else next.delete(key);
  return next;
}

function highlightMatches(sections: NodeListOf<HTMLElement>, pattern: RegExp) {
  for (const section of sections) {
    const walker = document.createTreeWalker(section, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
    for (const node of nodes) {
      if (node.parentElement?.closest('pre, script, style, template')) continue;
      let piece: DocumentFragment | undefined;
      let start = 0;
      for (const { 0: match, index } of node.data.matchAll(pattern)) {
        piece ??= document.createDocumentFragment();
        piece.append(node.data.slice(start, index));
        const mark = document.createElement('mark');
        mark.dataset.searchMatch = '';
        mark.textContent = match;
        piece.append(mark);
        start = index + match.length;
      }
      if (piece) {
        piece.append(node.data.slice(start));
        node.replaceWith(piece);
      }
    }
  }
}

export function setupQuestionBank(bank: HTMLElement) {
  const form = bank.querySelector<HTMLFormElement>('[data-question-filters]');
  const search = form?.querySelector<HTMLInputElement>('[name="q"]');
  const level = form?.querySelector<HTMLSelectElement>('[name="level"]');
  const type = form?.querySelector<HTMLSelectElement>('[name="type"]');
  const count = bank.querySelector<HTMLElement>('[data-question-count]');
  const review = bank.querySelector<HTMLButtonElement>('[data-question-review]');
  const empty = bank.querySelector<HTMLElement>('[data-question-empty]');
  const reset = bank.querySelector<HTMLAnchorElement>('[data-question-reset]');
  const toolbar = bank.querySelector<HTMLElement>('.question-toolbar');
  if (!form || !search || !level || !type || !count || !review || !empty || !reset || !toolbar) return;

  const rows = Array.from(bank.querySelectorAll<HTMLLIElement>('[data-question-id]'), (row) => {
    const fields = row.querySelectorAll<HTMLElement>('[data-question-search]');
    return {
      row,
      id: row.dataset.questionId ?? '',
      card: row.querySelector<HTMLDetailsElement>('.question-card')!,
      number: row.querySelector<HTMLElement>('.question-number')!,
      status: row.querySelector<HTMLElement>('[data-review-state]')!,
      content: row.querySelector<HTMLElement>('[data-question-content]')!,
      permalink: undefined as HTMLAnchorElement | undefined,
      answer: undefined as MountedAnswer | undefined,
      loading: false,
      fields,
      text: Array.from(fields, ({ textContent }) => textContent).join(' ').toLowerCase(),
    };
  });
  type Row = typeof rows[number];

  const links = [
    ...Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-role-filter]'), (link) => ({
      link, key: 'role' as const, value: link.dataset.roleFilter ?? '',
    })),
    ...Array.from(bank.querySelectorAll<HTMLAnchorElement>('[data-topic-filter]'), (link) => ({
      link, key: 'topic' as const, value: link.dataset.topicFilter ?? '',
    })),
  ];
  const matchesFacet = (row: HTMLLIElement, name: Facet, value: string) =>
    (row.dataset[name] ?? '').split(' ').includes(value);
  const matchesSearch = (text: string, terms: string[]) => terms.every((term) => text.includes(term));
  const searchText = ({ id, text }: Row, index?: SearchIndex) => index?.[id] ?? text;

  let matchingIds: string[] = [];
  let previousTerms = '';
  let previousIndex: SearchIndex | undefined;
  let pattern: RegExp | undefined;
  let searchIndex: SearchIndex | undefined;
  let pendingIndex: Promise<SearchIndex> | undefined;
  let viewRevision = 0;
  let refreshTimer: number | undefined;
  const rated = new Map<string, Rating>();

  const loadSearchIndex = () => {
    pendingIndex ??= fetch(questionSearchUrl).then(async (response) => {
      if (!response.ok) throw new Error(`Search index: ${response.status}`);
      const index: unknown = await response.json();
      if (!index || typeof index !== 'object' ||
          !rows.every(({ id }) => typeof (index as SearchIndex)[id] === 'string')) {
        throw new Error('Search index does not match the bank');
      }
      searchIndex = index as SearchIndex;
      return searchIndex;
    }).finally(() => { pendingIndex = undefined; });
    return pendingIndex;
  };

  const refreshReview = () => {
    const cards = reviewSnapshot();
    const now = Date.now();
    let nextDue = Infinity;
    for (const { row, id, status, answer } of rows) {
      const state = cards[id];
      const due = state ? Date.parse(state.due) : Infinity;
      const saved = rated.get(id);
      status.textContent = state ? (due <= now ? 'Due' : `Box ${state.box}`) : 'New';
      status.classList.toggle('due', due <= now);
      for (const button of answer?.ratingButtons ?? []) {
        button.disabled = saved !== undefined;
        button.setAttribute('aria-pressed', String(button.dataset.rating === (saved ?? state?.last)));
      }
      if (!row.hidden && due > now) nextDue = Math.min(nextDue, due);
    }
    review.disabled = dueIds(matchingIds, new Date(now)).length === 0;
    window.clearTimeout(refreshTimer);
    if (Number.isFinite(nextDue)) {
      refreshTimer = window.setTimeout(refreshReview, Math.min(nextDue - now, 2_147_483_647));
    }
  };

  const fields = [search, level, type];
  const showFilters = (params: URLSearchParams) => {
    for (const field of fields) {
      const value = params.get(field.name) ?? '';
      if (field.value !== value) field.value = value;
    }
    for (const { link, key, value } of links) {
      const current = (params.get(key) ?? '') === value;
      if (current) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      link.href = withParams(questionListUrl, withFilter(params, key, current ? '' : value));
    }
  };

  const showResults = (params: URLSearchParams, index?: SearchIndex) => {
    const terms = searchTerms(params);
    const signature = terms.join(' ');
    const queryChanged = signature !== previousTerms || (terms.length > 0 && index !== previousIndex);
    if (queryChanged) {
      const parents = new Set<ParentNode>();
      for (const mark of bank.querySelectorAll('mark[data-search-match]')) {
        if (mark.parentNode) parents.add(mark.parentNode);
        mark.replaceWith(...mark.childNodes);
      }
      for (const parent of parents) parent.normalize();
      pattern = undefined;
      if (terms.length) {
        const escaped = [...new Set(terms)].sort((a, b) => b.length - a.length)
          .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        pattern = new RegExp(escaped.join('|'), 'giu');
      }
      previousTerms = signature;
    }
    previousIndex = index;
    matchingIds = [];
    for (const entry of rows) {
      const { row, id, number, fields, content, answer, permalink } = entry;
      const textMatches = matchesSearch(searchText(entry, index), terms);
      const matches = textMatches && facetNames.every((name) => {
        const value = params.get(name);
        return !value || matchesFacet(row, name, value);
      });
      row.hidden = !matches;
      if (textMatches && queryChanged && pattern) {
        highlightMatches(fields, pattern);
        if (answer) highlightMatches(content.querySelectorAll('[data-question-search]'), pattern);
      }
      if (matches) {
        number.textContent = String(matchingIds.push(id)).padStart(2, '0');
      }
      if (permalink) permalink.href = withParams(questionUrl(id), params);
    }
    count.textContent = `${matchingIds.length} shown${terms.length && !index ? '. Answer search unavailable.' : ''}`;
    empty.hidden = matchingIds.length > 0;
    refreshReview();
  };

  const showView = (params: URLSearchParams, target?: Row, hash = '') => {
    const revision = ++viewRevision;
    const previous = params.toString();
    if (target) {
      for (const name of facetNames) {
        const value = params.get(name);
        if (value && !matchesFacet(target.row, name, value)) params.delete(name);
      }
      target.card.open = true;
      void loadAnswer(target);
    }
    showFilters(params);
    const terms = searchTerms(params);
    const finish = (index?: SearchIndex) => {
      if (revision !== viewRevision) return;
      if (target && !matchesSearch(searchText(target, index), terms)) params.delete('q');
      if (target && previous !== params.toString()) {
        window.history.replaceState(window.history.state, '', `${withParams(questionListUrl, params)}#${hash}`);
        showFilters(params);
      }
      showResults(params, index);
      target?.card.scrollIntoView();
    };
    if (terms.length && !searchIndex) {
      count.textContent = 'Loading search…';
      empty.hidden = true;
      matchingIds = [];
      review.disabled = true;
      void loadSearchIndex().then(finish, () => finish());
    } else {
      finish(searchIndex);
    }
  };

  function restoreFromUrl() {
    const params = readFilters();
    const hash = window.location.hash.slice(1);
    let targetId = hash;
    try { targetId = decodeURIComponent(hash); } catch { /* Leave invalid fragment encoding alone. */ }
    const target = hash ? rows.find(({ id, card }) => card.id === targetId || id === targetId) : undefined;
    showView(params, target, hash);
  }

  function applyFilters(params: URLSearchParams, history: 'pushState' | 'replaceState') {
    window.history[history](null, '', withParams(questionListUrl, filterParams(params)));
    showView(params);
  }

  function readForm() {
    const params = readFilters();
    for (const field of fields) {
      if (field.value) params.set(field.name, field.value);
      else params.delete(field.name);
    }
    applyFilters(params, 'replaceState');
  }

  function feedback(element: HTMLElement, message: string) {
    element.textContent = message;
    element.hidden = false;
  }

  function isOrdinaryClick(event: MouseEvent) {
    return event.button === 0 && !event.ctrlKey && !event.metaKey && !event.shiftKey && !event.altKey;
  }

  form.addEventListener('input', readForm);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    readForm();
  });
  for (const { link } of links) {
    link.addEventListener('click', (event) => {
      if (!isOrdinaryClick(event)) return;
      event.preventDefault();
      applyFilters(new URL(link.href).searchParams, 'pushState');
    });
  }
  reset.addEventListener('click', (event) => {
    if (!isOrdinaryClick(event)) return;
    event.preventDefault();
    applyFilters(new URLSearchParams(), 'pushState');
    search.focus();
  });
  review.addEventListener('click', () => startSession(dueIds(matchingIds), readFilters()));
  window.addEventListener('popstate', restoreFromUrl);
  window.addEventListener('hashchange', restoreFromUrl);
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    for (const { id, answer } of rows) {
      if (answer && rated.has(id)) answer.feedback.hidden = true;
    }
    rated.clear();
    restoreFromUrl();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'pom-proof:review' || event.key === null) refreshReview();
  });

  function wireAnswer({ card, id, content }: Row, { feedback: message, ratingButtons }: MountedAnswer) {
    for (const button of ratingButtons) {
      button.addEventListener('click', () => {
        if (rated.has(id)) return;
        const rating = ratings.find(({ id }) => id === button.dataset.rating);
        if (!rating) return;
        const reviewedAt = new Date();
        let state: CardState;
        try {
          state = rate(id, rating.id, reviewedAt);
        } catch {
          feedback(message, 'The browser could not save your rating. Check its storage settings and try again.');
          return;
        }
        rated.set(id, state.last);
        refreshReview();
        feedback(message, `Rated ${rating.label}. ${nextReviewLabel(state.due, reviewedAt)}`);
      });
    }
    content.querySelector('[data-question-copy]')?.addEventListener('click', async () => {
      try {
        const link = new URL(`${questionListUrl}#${encodeURIComponent(card.id)}`, window.location.origin);
        await navigator.clipboard.writeText(link.href);
        feedback(message, 'Link copied');
      } catch {
        feedback(message, 'Could not copy the link. Open the question page and copy the address from your browser.');
      }
    });
  }

  async function loadAnswer(entry: Row) {
    if (entry.answer || entry.loading) return;
    const { content, id } = entry;
    entry.loading = true;
    const message = document.createElement('p');
    message.className = 'question-feedback';
    message.setAttribute('role', 'status');
    content.replaceChildren(message);
    content.hidden = false;
    message.textContent = 'Loading answer…';

    try {
      const response = await fetch(questionFragmentUrl(id));
      if (!response.ok) throw new Error(`Answer: ${response.status}`);
      const template = document.createElement('template');
      template.innerHTML = await response.text();
      const fragment = template.content.firstElementChild;
      const permalink = fragment?.querySelector<HTMLAnchorElement>('[data-question-permalink]');
      const feedback = fragment?.querySelector<HTMLElement>('[data-question-feedback]');
      if (!(fragment instanceof HTMLElement) || fragment.dataset.questionFragment !== id || !permalink || !feedback) {
        throw new Error('Answer fragment does not match the card');
      }
      const answer = { feedback, ratingButtons: fragment.querySelectorAll<HTMLButtonElement>('[data-rating]') };
      setupCodeExamples(fragment);
      content.replaceChildren(...fragment.childNodes);
      entry.permalink = permalink;
      permalink.href = withParams(questionUrl(id), readFilters());
      wireAnswer(entry, answer);
      if (pattern) highlightMatches(content.querySelectorAll('[data-question-search]'), pattern);
      entry.answer = answer;
      refreshReview();
    } catch {
      const permalink = document.createElement('a');
      permalink.className = 'button quiet';
      permalink.href = withParams(questionUrl(id), readFilters());
      permalink.textContent = 'Open page';
      entry.permalink = permalink;
      message.textContent = 'Answer could not load.';
      content.replaceChildren(message, permalink);
    } finally {
      entry.loading = false;
    }
  }

  for (const entry of rows) {
    entry.card.addEventListener('toggle', () => {
      if (entry.card.open) void loadAnswer(entry);
    });
    if (entry.card.open) void loadAnswer(entry);
  }

  const updateSticky = () => {
    const top = Number.parseFloat(getComputedStyle(toolbar).top);
    toolbar.toggleAttribute('data-stuck', Number.isFinite(top) && toolbar.getBoundingClientRect().top === top);
  };
  window.addEventListener('scroll', updateSticky, { passive: true });
  window.addEventListener('resize', updateSticky);
  for (const control of document.querySelectorAll<HTMLElement>('[data-bank-control]')) control.hidden = false;
  restoreFromUrl();
  updateSticky();
}
