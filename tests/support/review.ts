import { expect, type Page } from '@playwright/test';
import { discoverQuestions, questionTitle, type DiscoveredQuestion } from './questions';

export const reviewStorageKey = 'pom-proof:review';

/** Questions in the order the list shows them: by title, then by id. */
export function questionsInListOrder(questions = discoverQuestions()) {
  return [...questions].sort((a, b) => questionTitle(a).localeCompare(questionTitle(b), 'en') || a.id.localeCompare(b.id, 'en'));
}

/** Opens a question page and waits until its keyboard shortcuts are live. */
export async function openQuestion(page: Page, question: DiscoveredQuestion) {
  const response = await page.goto(question.path);
  expect(response?.status(), `${question.path} status`).toBe(200);
  await expect(page.getByRole('heading', { level: 1, name: questionTitle(question) })).toBeVisible();
  // The page script reveals the Space hint once its key handler is attached.
  await expect(page.getByText('Space', { exact: true })).toBeVisible();
}

const ratingKey = { missed: '1', shaky: '2', solid: '3' } as const;

/**
 * Reveals the answer with Space and rates it with its number key, the keyboard path the page
 * offers, then waits for the page to move on (next question in a session, or the list).
 */
export async function rateByKeyboard(page: Page, question: DiscoveredQuestion, rating: keyof typeof ratingKey) {
  const oneLine = String(question.frontmatter.oneLine);
  await expect(page.getByText(oneLine, { exact: true })).toBeHidden();
  await page.keyboard.press('Space');
  await expect(page.getByText(oneLine, { exact: true })).toBeVisible();
  const ratings = page.getByRole('group', { name: 'Rate your answer' });
  await expect(ratings.getByRole('button', { name: /^Missed$|^Shaky$|^Solid$/ })).toHaveCount(3);
  const leaving = page.waitForURL((url) => !url.pathname.endsWith(`/questions/${question.id}/`));
  await page.keyboard.press(ratingKey[rating]);
  await leaving;
}

/**
 * The bank card for one question, found by its title heading. Titles are not links in the bank: the
 * card's summary holds the heading, and "Open page" inside the expanded card links to the question page.
 */
export function questionRow(page: Page, question: DiscoveredQuestion) {
  return page.getByRole('list', { name: 'Questions' }).getByRole('listitem')
    .filter({ has: page.getByRole('heading', { level: 2, name: questionTitle(question), exact: true }) });
}

export const reviewState = (page: Page, question: DiscoveredQuestion) => questionRow(page, question).locator('[data-review-state]');

/** Expands a bank card by its summary and waits for the inline answer's lead line. */
export async function expandQuestion(page: Page, question: DiscoveredQuestion) {
  const card = questionRow(page, question);
  await expect(card).toHaveCount(1);
  const oneLine = card.getByText(String(question.frontmatter.oneLine), { exact: true });
  await expect(oneLine).toBeHidden();
  await card.getByRole('heading', { level: 2, name: questionTitle(question), exact: true }).click();
  await expect(oneLine).toBeVisible();
  return card;
}

/** The stored review cards, read straight from the browser. */
export function storedCards(page: Page): Promise<Record<string, { box: number; due: string; seen: number; last: string }>> {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '{}'), reviewStorageKey);
}
