import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'copy-run-id',
  kind: 'locator',
  title: 'Copy the run ID',
  difficulty: 'Easy',
  topics: ['Locators', 'Test IDs'],
  roles: ['automation', 'sdet'],
  summary: 'Find the Copy button for the ID rather than the command.',
  prompt: 'Select the Copy button next to Run ID in the reproduction panel. Leave the Copy button for the command alone. The panel exposes stable test IDs for both buttons.',
  allow: ['css', 'xpath', 'playwright'],
  target: '[data-testid="copy-run-id"]',
  html: `
<main>
  <h1>Reproduce this run</h1>
  <section>
    <div class="css-1q2w3e">
      <h2>Run ID</h2>
      <div class="css-2b4q0p"><code>run-94823</code><button type="button" data-testid="copy-run-id">Copy</button></div>
    </div>
    <div class="css-1q2w3e">
      <h2>Command</h2>
      <div class="css-2b4q0p"><code>npm run test:checkout</code><button type="button" data-testid="copy-command">Copy</button></div>
    </div>
  </section>
</main>`,
  examples: {
    css: '[data-testid="copy-run-id"]',
    xpath: "//*[@data-testid='copy-run-id']",
    playwright: "page.getByTestId('copy-run-id')",
  },
  hints: ['The test contract can distinguish two buttons that have the same displayed name.'],
  solutionNotes: 'Both buttons are named Copy. `data-testid="copy-run-id"` identifies the intended action even if the panel changes order or the button text is translated.',
  interviewNotes: 'Use an agreed test ID when the team wants a stable identifier independent of wording. You can still use a separate role or name assertion if accessible wording is part of what the test verifies. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
