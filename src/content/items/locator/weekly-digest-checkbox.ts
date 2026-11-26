import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'weekly-digest-checkbox',
  kind: 'locator',
  title: 'Find the weekly digest checkbox',
  difficulty: 'Easy',
  topics: ['Locators', 'Form labels', 'Checkboxes'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Select a checkbox whose label wraps the input.',
  prompt: 'Select the checkbox for Weekly digest in Email preferences. Leave the Daily digest checkbox alone.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'input[name="digest"][value="weekly"]',
  html: `
<main>
  <h1>Email preferences</h1>
  <form>
    <fieldset>
      <legend>Activity emails</legend>
      <div class="css-1q2w3e"><label><input type="checkbox" name="digest" value="daily" checked><span>Daily digest</span></label></div>
      <div class="css-1q2w3e"><label><input type="checkbox" name="digest" value="weekly"><span>Weekly digest</span></label></div>
      <div class="css-1q2w3e"><label><input type="checkbox" name="product_news"><span>Product updates</span></label></div>
    </fieldset>
    <button type="submit">Save preferences</button>
  </form>
</main>`,
  examples: {
    css: 'input[name="digest"][value="weekly"]',
    xpath: "//input[@name='digest' and @value='weekly']",
    playwright: "page.getByLabel('Weekly digest', { exact: true })",
  },
  hints: ['A label can be associated with a control by containing it.'],
  solutionNotes: 'The `label` encloses the checkbox and its displayed name, so `getByLabel` returns the input. Searching for the words with `getByText` returns the span instead. In raw CSS or XPath, `name` and `value` identify the choice the form submits.',
  interviewNotes: 'Explain the difference between a locator for a text assertion and one for a checkbox assertion. Point out that a native wrapping label gives the control its name without an extra ARIA attribute. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
  ],
};

export default item;
