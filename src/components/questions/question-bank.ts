import { dueIds, rate, reviewSnapshot, type Rating } from '../../lib/review';
import {
  filterParams, questionLevels, questionListUrl, questionRoles, questionTopics, questionTypes,
  questionUrl, ratings, startSession, withParams,
} from './questions';

const facets = { role: questionRoles, topic: questionTopics, level: questionLevels, type: questionTypes };
type Facet = keyof typeof facets;
const facetNames = Object.keys(facets) as Facet[];

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
      permalink: row.querySelector<HTMLAnchorElement>('[data-question-permalink]')!,
      status: row.querySelector<HTMLElement>('[data-review-state]')!,
      feedback: row.querySelector<HTMLElement>('[data-question-feedback]')!,
      ratingButtons: row.querySelectorAll<HTMLButtonElement>('[data-rating]'),
      fields,
      text: Array.from(fields, ({ textContent }) => textContent).join(' ').toLowerCase(),
    };
  });

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

  let matchingIds: string[] = [];
  let previousTerms = '';
  let refreshTimer: number | undefined;

  const refreshReview = () => {
    const cards = reviewSnapshot();
    const now = Date.now();
    let nextDue = Infinity;
    for (const { row, id, status, ratingButtons } of rows) {
      const state = cards[id];
      const due = state ? Date.parse(state.due) : Infinity;
      status.textContent = state ? (due <= now ? 'Due' : `Box ${state.box}`) : 'New';
      status.classList.toggle('due', due <= now);
      for (const button of ratingButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.rating === state?.last));
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

  const showResults = (params: URLSearchParams) => {
    const terms = searchTerms(params);
    const signature = terms.join(' ');
    const queryChanged = signature !== previousTerms;
    let pattern: RegExp | undefined;
    if (queryChanged) {
      const parents = new Set<ParentNode>();
      for (const mark of bank.querySelectorAll('mark[data-search-match]')) {
        if (mark.parentNode) parents.add(mark.parentNode);
        mark.replaceWith(...mark.childNodes);
      }
      for (const parent of parents) parent.normalize();
      if (terms.length) {
        const escaped = [...new Set(terms)].sort((a, b) => b.length - a.length)
          .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        pattern = new RegExp(escaped.join('|'), 'giu');
      }
      previousTerms = signature;
    }
    matchingIds = [];
    for (const { row, id, number, fields, text, permalink } of rows) {
      const textMatches = matchesSearch(text, terms);
      const matches = textMatches && facetNames.every((name) => {
        const value = params.get(name);
        return !value || matchesFacet(row, name, value);
      });
      row.hidden = !matches;
      if (textMatches && pattern) highlightMatches(fields, pattern);
      if (matches) {
        number.textContent = String(matchingIds.push(id)).padStart(2, '0');
        permalink.href = withParams(questionUrl(id), params);
      }
    }
    count.textContent = `${matchingIds.length} shown`;
    empty.hidden = matchingIds.length > 0;
    refreshReview();
  };

  function restoreFromUrl() {
    const params = readFilters();
    const hash = window.location.hash.slice(1);
    let targetId = hash;
    try { targetId = decodeURIComponent(hash); } catch { /* Leave invalid fragment encoding alone. */ }
    const target = hash ? rows.find(({ id, card }) => card.id === targetId || id === targetId) : undefined;
    if (target) {
      const previous = params.toString();
      for (const name of facetNames) {
        const value = params.get(name);
        if (value && !matchesFacet(target.row, name, value)) params.delete(name);
      }
      if (!matchesSearch(target.text, searchTerms(params))) params.delete('q');
      if (previous !== params.toString()) {
        window.history.replaceState(window.history.state, '', `${withParams(questionListUrl, params)}#${hash}`);
      }
    }
    showFilters(params);
    showResults(params);
    if (target) {
      target.card.open = true;
      target.card.scrollIntoView();
    }
  }

  function applyFilters(params: URLSearchParams, history: 'pushState' | 'replaceState') {
    window.history[history](null, '', withParams(questionListUrl, filterParams(params)));
    showFilters(params);
    showResults(params);
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
    if (event.persisted) restoreFromUrl();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === 'pom-proof:review' || event.key === null) refreshReview();
  });

  for (const { card, id, feedback: message, ratingButtons } of rows) {
    for (const button of ratingButtons) {
      button.addEventListener('click', () => {
        const rating: Rating | undefined = ratings.find(({ id }) => id === button.dataset.rating)?.id;
        if (!rating) return;
        try {
          rate(id, rating);
          refreshReview();
          feedback(message, `${button.textContent?.trim()} saved`);
        } catch {
          feedback(message, 'Rating could not be saved; check browser storage and try again.');
        }
      });
    }
    card.querySelector('[data-question-copy]')?.addEventListener('click', async () => {
      try {
        const link = new URL(`${questionListUrl}#${encodeURIComponent(card.id)}`, window.location.origin);
        await navigator.clipboard.writeText(link.href);
        feedback(message, 'Link copied');
      } catch {
        feedback(message, 'Link could not be copied; open the question page and copy its address.');
      }
    });
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
