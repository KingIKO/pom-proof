import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'retry-current-failed-deployments',
  kind: 'locator',
  title: 'Find the retry buttons for current failures',
  difficulty: 'Hard',
  topics: ['Locators', 'Relative filters', 'Multiple matches'],
  roles: ['automation', 'sdet'],
  summary: 'Select all retry buttons for failed deployments in the current list only.',
  prompt: 'Select every Retry button in Current deployments whose deployment status is Failed. There are two such buttons. Leave the successful deployment and the deployment history alone.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'ul[data-lane="current"] li[data-status="failed"] button[data-action="retry"]',
  html: `
<main>
  <h1>Deployments</h1>
  <div class="css-1q2w3e">
    <h2>Current deployments</h2>
    <ul data-lane="current" aria-label="Current deployments">
      <li data-status="failed"><strong>Checkout API</strong> <span>Failed</span><div class="css-8a2m1v"><button type="button" data-action="retry">Retry</button></div></li>
      <li data-status="passed"><strong>Billing jobs</strong> <span>Passed</span><p>Retried after a failed health check</p><div class="css-8a2m1v"><button type="button" data-action="retry">Retry</button></div></li>
      <li data-status="failed"><strong>Search index</strong> <span>Failed</span><div class="css-8a2m1v"><button type="button" data-action="retry">Retry</button></div></li>
    </ul>
  </div>
  <div class="css-1q2w3e">
    <h2>Deployment history</h2>
    <ul data-lane="history" aria-label="Deployment history">
      <li data-status="failed"><strong>Checkout API</strong> <span>Failed</span><div class="css-8a2m1v"><button type="button" data-action="retry">Retry</button></div></li>
    </ul>
  </div>
</main>`,
  examples: {
    css: 'ul[data-lane="current"] li[data-status="failed"] button[data-action="retry"]',
    xpath: "//ul[@data-lane='current']//li[@data-status='failed']//button[@data-action='retry']",
    playwright: "page.getByRole('list', { name: 'Current deployments', exact: true }).getByRole('listitem').filter({ has: page.getByText('Failed', { exact: true }) }).getByRole('button', { name: 'Retry', exact: true })",
  },
  hints: ['Scope to the current list, then find list items containing the exact Failed status.'],
  solutionNotes: 'There are two matches by design. Filtering each current item by an exact status excludes the passed job whose notes mention a failed check. A page-wide filter could also take the old failure from history.',
  interviewNotes: 'Explain why a single click with this multi-match locator would fail strictness in Playwright. Use it for a collection assertion, or scope to one deployment when performing an action. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
