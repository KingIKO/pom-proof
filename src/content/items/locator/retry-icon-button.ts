import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'retry-icon-button',
  kind: 'locator',
  title: 'Find the retry icon button',
  difficulty: 'Easy',
  topics: ['Locators', 'Accessible names'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Pick the retry control from a toolbar with icon-only buttons.',
  prompt: 'Select the Retry run button for the current checkout test run. The button is an icon in the toolbar next to View run log.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'button[aria-label="Retry run"]',
  html: `
<main>
  <h1>Checkout test run</h1>
  <p>Run #684 failed.</p>
  <div class="css-1q2w3e" role="group" aria-label="Run actions">
    <button class="css-8a2m1v" type="button" aria-label="View run log"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M2 4h12M2 8h12M2 12h9" fill="none" stroke="currentColor"/></svg></button>
    <button class="css-8a2m1v" type="button" aria-label="Retry run"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="M4 5a5 5 0 1 1-1 5M4 1v4H0" fill="none" stroke="currentColor"/></svg></button>
    <button class="css-8a2m1v" type="button" aria-label="Retry all failed runs"><svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16"><path d="m2 4 3 4-3 4m6-8 3 4-3 4" fill="none" stroke="currentColor"/></svg></button>
  </div>
</main>`,
  examples: {
    css: 'button[aria-label="Retry run"]',
    xpath: "//button[@aria-label='Retry run']",
    playwright: "page.getByRole('button', { name: 'Retry run', exact: true })",
  },
  hints: ['Inspect the button’s accessible name rather than its SVG.'],
  solutionNotes: 'The visible icon has no button text. The button itself is named by `aria-label`. Searching for visible text returns nothing, and the broader name “Retry” also matches the bulk action.',
  interviewNotes: 'A role and accessible name verify that an icon-only action still has a name a screen reader can announce. The SVG path is artwork and can change without changing the action. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
