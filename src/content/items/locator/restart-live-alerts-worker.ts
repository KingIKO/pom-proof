import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'restart-live-alerts-worker',
  kind: 'locator',
  title: 'Restart the live Alerts worker',
  difficulty: 'Hard',
  topics: ['Locators', 'Relative filters', 'Card filters'],
  roles: ['automation', 'sdet'],
  summary: 'Use both the worker name and environment to disambiguate Restart.',
  prompt: 'Select Restart on the worker card titled Alerts with the Live badge. The sandbox Alerts worker and the live Alerts archive worker are separate cards.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'article[data-worker="alerts"][data-tier="live"] button[data-action="restart"]',
  html: `
<main>
  <h1>Worker console</h1>
  <ul aria-label="Workers">
    <li><article data-worker="alerts" data-tier="sandbox" class="css-1q2w3e">
      <header><h2>Alerts</h2><span>Sandbox</span></header>
      <div class="css-7a4p6d"><p>Sends to a test inbox instead of live users.</p><button type="button" data-action="restart">Restart</button></div>
    </article></li>
    <li><article data-worker="alerts-archive" data-tier="live" class="css-1q2w3e">
      <header><h2>Alerts archive</h2><span>Live</span></header>
      <div class="css-7a4p6d"><p>Moves old alerts to cold storage.</p><button type="button" data-action="restart">Restart</button></div>
    </article></li>
    <li><article data-worker="alerts" data-tier="live" class="css-1q2w3e">
      <header><h2>Alerts</h2><span>Live</span></header>
      <div class="css-7a4p6d"><p>Delivers notifications to subscribers.</p><button type="button" data-action="restart">Restart</button></div>
    </article></li>
  </ul>
</main>`,
  examples: {
    css: 'article[data-worker="alerts"][data-tier="live"] button[data-action="restart"]',
    xpath: "//article[@data-worker='alerts' and @data-tier='live']//button[@data-action='restart']",
    playwright: "page.getByRole('article').filter({ has: page.getByRole('heading', { name: 'Alerts', exact: true }) }).filter({ has: page.getByText('Live', { exact: true }) }).getByRole('button', { name: 'Restart', exact: true })",
  },
  hints: ['Filter the card by an exact heading and an exact badge before looking for its button.'],
  solutionNotes: 'The exact title alone matches both Alerts cards. A loose text filter for Live also picks up the sandbox description’s “live users.” Find the exact badge inside the same card as the exact heading, then select Restart inside that card.',
  interviewNotes: 'In Playwright, the inner locator in `has` starts from each candidate card. Keep it relative to the card; a locator that starts at the page’s worker list has no such ancestor inside the card. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
