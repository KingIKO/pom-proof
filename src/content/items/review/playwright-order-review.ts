import type { ReviewItem } from '../../types';

const item: ReviewItem = {
  id: 'playwright-order-review',
  title: 'Review a Playwright order spec',
  kind: 'review',
  difficulty: 'Easy',
  topics: ['Playwright', 'Code review', 'Test isolation'],
  roles: ['automation', 'sdet', 'lead'],
  summary: 'Flag test smells in an order flow before it goes into CI.',
  prompt: 'This spec signs in to a fake order portal, creates an order and checks order details in a second test. Assume visible form labels and button names are available. Flag concrete problems, then explain which ones you would require the author to fix first. All credentials shown are fictional placeholders.',
  lang: 'typescript',
  code: `
import { test, expect } from '@playwright/test';

const account = { email: 'review-test@example.test', password: 'example-only' };
let orderId: string;

test('creates an order', async ({ page }) => {
  await page.goto('/login');
  await page.locator('form input:nth-child(2)').fill(account.email);
  await page.locator('.PasswordBox_input__7zK1').fill(account.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForTimeout(600);
  await page.getByRole('button', { name: 'Create order' }).click();
  orderId = new URL(page.url()).searchParams.get('order') ?? '';
});

test('shows order details', async ({ page }) => {
  await page.goto('/orders/' + orderId);
  await expect(page.getByRole('heading', { name: 'Order details' })).toBeVisible();
});`,
  issues: [
    { id: 'credentials', lines: [3, 3], category: 'Security or secrets', title: 'Credentials in source', explanation: 'Keep configured test credentials outside source control and use an isolated test account. The snippet uses placeholders, but this structure invites a real password to be committed.' },
    { id: 'position', lines: [8, 8], category: 'Brittle locator', title: 'Email located by position', explanation: 'A new field or wrapper can change the position. Locate the email field by its visible label.' },
    { id: 'css', lines: [9, 9], category: 'Brittle locator', title: 'Password located by a generated class', explanation: 'A stylesheet build can rename the class. Use the password field’s label.' },
    { id: 'sleep', lines: [11, 11], category: 'Hard-coded wait', title: 'Fixed wait after sign-in', explanation: 'Wait or assert on an authenticated page state. A fixed delay wastes time on fast runs and may finish too early on slower runs.' },
    { id: 'assert', lines: [13, 14], category: 'Missing or weak assertion', title: 'Order creation is never verified', explanation: 'Reading a query parameter with an empty fallback can finish with no order ID. Assert order confirmation and verify the newly created order.' },
    { id: 'shared', lines: [17, 17], category: 'Shared state between tests', title: 'Details test uses an order from a different test', explanation: 'The test fails in isolation and may start unauthenticated. Seed its own order and authenticate via an independent fixture.' },
  ],
  hints: ['A click can succeed without creating an order.', 'Ask whether the details test can run alone on a fresh worker.'],
  solutionNotes: 'Remove source credentials and make each test own its authenticated setup and test data. Replace selectors tied to presentation, remove the sleep and assert the order’s creation directly.',
  interviewNotes: 'Describe both the failure mode and the replacement for each concern. Prioritize false positives and cross-test coupling before cosmetic cleanup.',
  sources: [
    { label: 'Playwright: Best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'Playwright: Authentication', url: 'https://playwright.dev/docs/auth' },
    { label: 'OWASP: Secrets management cheat sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html' },
  ],
};

export default item;
