import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'monthly-quota-reset-note',
  kind: 'locator',
  title: 'Find the monthly quota reset note',
  difficulty: 'Medium',
  topics: ['Locators', 'CSS combinators', 'Duplicate text'],
  roles: ['automation', 'sdet'],
  summary: 'Find the help text beside the quota field rather than its preview copy.',
  prompt: 'Select the “Quota resets on 1 July” help text beside the Monthly quota field in usage settings. The billing preview repeats the same note.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'section[data-quota="monthly"] > label + p[data-kind="reset-note"]',
  html: `
<main>
  <h1>Usage settings</h1>
  <div class="css-1q2w3e">
    <form>
      <fieldset>
        <legend>Limits</legend>
        <section data-quota="monthly" aria-label="Monthly quota">
          <label for="input-48310">Monthly quota</label>
          <p data-kind="reset-note" id="note-48310">Quota resets on 1 July</p>
          <div class="css-2v9x4n"><input id="input-48310" name="monthly_quota" type="number" value="500" aria-describedby="note-48310"></div>
        </section>
        <button type="submit">Save limits</button>
      </fieldset>
    </form>
    <section data-quota="preview" aria-label="Billing preview">
      <h2>Billing preview</h2>
      <p data-kind="reset-note">Quota resets on 1 July</p>
    </section>
  </div>
</main>`,
  examples: {
    css: 'section[data-quota="monthly"] > label + p[data-kind="reset-note"]',
    xpath: "//section[@data-quota='monthly']/label/following-sibling::p[@data-kind='reset-note']",
    playwright: "page.getByRole('region', { name: 'Monthly quota', exact: true }).getByText('Quota resets on 1 July', { exact: true })",
  },
  hints: ['The matching note directly follows the field label in the monthly quota section.'],
  solutionNotes: 'The same words appear twice. Scope the lookup to the field’s section. In CSS, `>` fixes the label’s relationship to the section, and `+` selects the matching paragraph immediately after that label. The generated note ID is unnecessary.',
  interviewNotes: 'Use a short, meaningful relationship when the association is what the test checks. A named region can be a better scope if the design might place the note elsewhere inside it. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'MDN: CSS child combinator', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Child_combinator' },
    { label: 'MDN: CSS next-sibling combinator', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Next-sibling_combinator' },
  ],
};

export default item;
