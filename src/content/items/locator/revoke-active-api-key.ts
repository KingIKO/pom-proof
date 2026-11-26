import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'revoke-active-api-key',
  kind: 'locator',
  title: 'Revoke the active API key',
  difficulty: 'Medium',
  topics: ['Locators', 'CSS :not()', 'Disabled state'],
  roles: ['automation', 'sdet'],
  summary: 'Select the enabled Revoke button among old and active credentials.',
  prompt: 'Select the enabled Revoke button for the active Checkout CI key. Ignore the disabled Revoke button for its retired predecessor.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'button[data-action="revoke"]:not([disabled])',
  html: `
<main>
  <h1>API keys</h1>
  <div class="css-1q2w3e">
    <div class="css-7q4x2g">
      <h2>Checkout CI</h2><p>Retired key ending in 29A7</p>
      <button class="css-1ab2de" type="button" data-action="revoke" disabled>Revoke</button>
    </div>
    <div class="css-7q4x2g">
      <h2>Checkout CI</h2><p>Active key ending in 98C2</p>
      <button class="css-1ab2de" type="button" data-action="revoke">Revoke</button>
    </div>
  </div>
  <button type="button" data-action="revoke-all">Revoke all</button>
</main>`,
  examples: {
    css: 'button[data-action="revoke"]:not([disabled])',
    xpath: "//button[@data-action='revoke' and not(@disabled)]",
    playwright: "page.getByRole('button', { name: 'Revoke', exact: true, disabled: false })",
  },
  hints: ['A disabled button still has a role and a name.'],
  solutionNotes: 'An exact name excludes Revoke all but still matches both individual buttons. Add the enabled-state condition. The CSS and XPath examples exclude the literal `disabled` attribute because that is how this fixture marks the retired action.',
  interviewNotes: 'Separate matching an element from being able to click it. CSS `:not([disabled])` is specific to the markup here; it does not account for every source of disabled state, such as a disabled fieldset. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'MDN: CSS :not()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:not' },
  ],
};

export default item;
