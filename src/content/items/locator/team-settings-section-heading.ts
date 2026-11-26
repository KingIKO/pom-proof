import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'team-settings-section-heading',
  kind: 'locator',
  title: 'Find the team settings section heading',
  difficulty: 'Medium',
  topics: ['Locators', 'Heading levels', 'Hidden elements'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Select the live level-two heading when the page title uses the same words.',
  prompt: 'Select the visible level-two heading named Team settings. The page title has the same name at level one.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'section[data-panel="team"] h2:not([hidden])',
  html: `
<main>
  <h1>Team settings</h1>
  <div class="css-1q2w3e">
    <section data-panel="team">
      <h2 class="css-7c1m5s" hidden>Team settings</h2>
      <h2 class="css-7c1m5s">Team settings</h2>
      <p>Default permissions for new team members.</p>
    </section>
    <section data-panel="billing">
      <h2>Billing settings</h2>
      <p>Invoice and receipt preferences.</p>
    </section>
  </div>
</main>`,
  examples: {
    css: 'section[data-panel="team"] h2:not([hidden])',
    xpath: "//h2[normalize-space(.)='Team settings' and not(@hidden)]",
    playwright: "page.getByRole('heading', { name: 'Team settings', level: 2, exact: true })",
  },
  hints: ['The heading’s name and its position in the heading hierarchy are separate properties.'],
  solutionNotes: 'A name-only role locator returns both visible headings. Adding `level: 2` selects the right level in the heading hierarchy. The role locator excludes the hidden copy by default; raw CSS and XPath explicitly exclude the fixture’s `hidden` attribute.',
  interviewNotes: 'Test heading level when the structure matters to users of assistive technology. Raw CSS like `:not([hidden])` only checks one attribute on the selected element; it says nothing about styles or hidden ancestors. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'MDN: CSS :not()', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:not' },
  ],
};

export default item;
