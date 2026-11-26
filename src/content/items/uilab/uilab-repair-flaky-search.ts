import type { UiLabItem } from '../../types';

function app(fault = '') {
  return `
    const form = document.querySelector('form');
    const field = document.querySelector('#order');
    const button = form.querySelector('button');
    const results = document.querySelector('[aria-label="Search results"]');
    const status = document.querySelector('[role=status]');
    let searches = 0;
    function refresh() {
      button.disabled = !field.value.trim() || searches % 2 === 1;
    }
    field.addEventListener('input', refresh);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (button.disabled) return;
      const order = field.value.trim().toUpperCase();
      const known = order === 'A-204' || order === 'B-105';
      searches++;
      refresh();
      status.textContent = 'Searching';
      results.setAttribute('aria-busy', 'true');
      if (${fault !== 'stale-results'}) results.replaceChildren();
      setTimeout(() => {
        searches++;
        refresh();
        if (${fault !== 'busy-stuck'}) results.setAttribute('aria-busy', 'false');
        if (known) {
          const row = document.createElement('li');
          row.textContent = order + ' · ' + (order === 'A-204' && ${fault !== 'wrong-status'} ? 'Ready for pickup' : 'Shipped');
          results.append(row);
          status.textContent = '1 order found';
        } else {
          status.textContent = ${fault === 'missing-empty' ? "''" : "'No orders found'"};
        }
      }, searches === 1 ? 480 : 140);
    });
    refresh();
  `;
}

const item: UiLabItem = {
  id: 'uilab-repair-flaky-search',
  kind: 'uilab',
  title: 'Repair a flaky order search test',
  difficulty: 'Medium',
  topics: ['Playwright', 'Flakiness', 'Locators'],
  roles: ['automation', 'sdet'],
  summary: 'Replace a fixed wait and a structural selector, then cover repeat searches.',
  prompt: `The starter test is broken. It assumes the response will beat a fixed wait and ties the Search button to its current wrappers. Fix it, then extend the suite to cover the search contract.

- Blank input disables **Search**. A nonblank order number starts a search. The results list is named **Search results** and is marked busy while waiting for the response.
- \`A-204\` returns **A-204 · Ready for pickup**. \`B-105\` returns **B-105 · Shipped**. A completed search clears the busy state.
- An unknown number shows **No orders found** and leaves the results list empty, even after a successful search.

The first lookup in a fresh app takes longer than later lookups. Write assertions against the result and busy state instead of choosing a larger sleep.`,
  hints: [
    'Replace the structural selector with `page.getByRole("button", { name: "Search" })`.',
    '`await expect(row).toHaveText(...)` retries. An assertion on the value from `await row.count()` checks one snapshot.',
    'Run a successful search and an unknown search in the same test. A stale result cannot show up if that test has no earlier result.',
    'Use `toHaveAttribute("aria-busy", "false")` to check that the results area has finished processing.',
  ],
  solutionNotes: `The first repair is to wait for the right result with a locator assertion. The second is to identify the Search button by what a user can find. In Playwright, a single call to \`count()\` samples the current matches; \`toHaveCount\` retries. Using the button's accessible name also survives an extra layout wrapper.

Cover replacement as well as lookup: search for a known order, then an unknown one, wait for the empty message, and assert zero result rows. Confirm the results area is no longer busy after search completes.`,
  interviewNotes: 'Explain how to distinguish a test race from a real slow-search bug. Check the result separately from elapsed time; a latency requirement needs its own budget and evidence.',
  sources: [
    { label: 'Playwright: Auto-waiting', url: 'https://playwright.dev/docs/actionability' },
    { label: 'Playwright: Locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright: Assertions', url: 'https://playwright.dev/docs/test-assertions' },
    { label: 'Playwright: Best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
  html: `<main>
    <h1>Order search</h1>
    <form>
      <label for="order">Order number</label>
      <div class="search-entry"><input id="order" autocomplete="off"><div class="controls"><button type="submit" class="primary">Search</button></div></div>
    </form>
    <p role="status"></p>
    <ul aria-label="Search results" aria-busy="false"></ul>
  </main>`,
  css: `
    .search-entry { display: grid; grid-template-columns: 1fr auto; gap: 8px; }
    ul { margin: 8px 0; padding-left: 22px; }
  `,
  script: app(),
  mutants: [
    { id: 'wrong-status', label: 'A pickup order is shown as shipped', script: app('wrong-status') },
    { id: 'missing-empty', label: 'An unknown order returns no empty-state message', script: app('missing-empty') },
    { id: 'stale-results', label: 'The prior order remains after a search finds nothing', script: app('stale-results') },
    { id: 'busy-stuck', label: 'The results list stays busy after the search completes', script: app('busy-stuck') },
  ],
  starter: `test('Shows a pickup order', async ({ page }) => {
  await page.getByLabel('Order number').fill('A-204');
  await page.locator('main > form > div > div.controls > button:nth-child(1)').click();
  await page.waitForTimeout(60);
  expect(await page.getByRole('listitem').count()).toBe(1);
});

// Repair the test, then cover a search with no results.
`,
  referenceTests: `test('Looks up a pickup order and finishes loading', async ({ page }) => {
  const search = page.getByRole('button', { name: 'Search' });
  const list = page.getByRole('list', { name: 'Search results' });
  await expect(search).toBeDisabled();
  await page.getByLabel('Order number').fill('A-204');
  await search.click();
  await expect(list).toHaveAttribute('aria-busy', 'true');
  await expect(list.getByRole('listitem')).toHaveText('A-204 · Ready for pickup');
  await expect(list).toHaveAttribute('aria-busy', 'false');
});

test('An unknown order clears the previous result', async ({ page }) => {
  const input = page.getByLabel('Order number');
  const search = page.getByRole('button', { name: 'Search' });
  const rows = page.getByRole('list', { name: 'Search results' }).getByRole('listitem');
  await expect(rows).toHaveCount(0);
  await input.fill('B-105');
  await search.click();
  await expect(rows).toHaveText('B-105 · Shipped');
  await input.fill('Z-999');
  await search.click();
  await expect(page.getByRole('status')).toHaveText('No orders found');
  await expect(rows).toHaveCount(0);
});
`,
};

export default item;
