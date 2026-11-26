import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'reopen-support-ticket',
  kind: 'locator',
  title: 'Reopen the cart sync ticket',
  difficulty: 'Medium',
  topics: ['Locators', 'Card filters', 'Scoping'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Find the Reopen button within a specific support ticket card.',
  prompt: 'Select Reopen on ticket QA-72, Cart sync after reconnect. The mobile follow-up has a nearly identical title.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'article[data-ticket="QA-72"] button[data-action="reopen"]',
  html: `
<main>
  <h1>Closed support tickets</h1>
  <ul aria-label="Ticket cards">
    <li>
      <article data-ticket="QA-720" class="css-1q2w3e">
        <h2>Cart sync after reconnect</h2><p>Ticket QA-720: mobile follow-up</p>
        <div class="css-8a2m1v"><button type="button" data-action="reopen">Reopen</button></div>
      </article>
    </li>
    <li>
      <article data-ticket="QA-72" class="css-1q2w3e">
        <h2>Cart sync after reconnect</h2><p>Ticket QA-72: web checkout</p>
        <div class="css-8a2m1v"><button type="button" data-action="reopen">Reopen</button></div>
      </article>
    </li>
    <li>
      <article data-ticket="QA-81" class="css-1q2w3e">
        <h2>Delivery note truncated</h2><p>Ticket QA-81: web checkout</p>
        <div class="css-8a2m1v"><button type="button" data-action="reopen">Reopen</button></div>
      </article>
    </li>
  </ul>
</main>`,
  examples: {
    css: 'article[data-ticket="QA-72"] button[data-action="reopen"]',
    xpath: "//article[@data-ticket='QA-72']//button[@data-action='reopen']",
    playwright: "page.getByRole('article').filter({ hasText: 'Ticket QA-72:' }).getByRole('button', { name: 'Reopen', exact: true })",
  },
  hints: ['The title is shared, while the full ticket ID identifies one card.'],
  solutionNotes: 'The two cart cards share a title. Filter on the ticket text through the colon so QA-720 cannot match, or use the exact `data-ticket` value. Then locate Reopen within the chosen card.',
  interviewNotes: 'Say which part of the page can change safely. This locator survives card reordering and wrapper changes, but the text-based version depends on the displayed ticket number and its delimiter. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
