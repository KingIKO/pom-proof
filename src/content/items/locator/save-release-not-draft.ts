import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'save-release-not-draft',
  kind: 'locator',
  title: 'Save the release without saving a draft',
  difficulty: 'Easy',
  topics: ['Locators', 'Exact names'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Distinguish Save from Save draft.',
  prompt: 'Select the button named Save in the release form. Save draft is a different action and should not match.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'button[name="intent"][value="publish"]',
  html: `
<main>
  <h1>Release notes</h1>
  <form>
    <fieldset>
      <legend>Release details</legend>
      <label for="input-48219">Title</label>
      <div class="css-3c1x0v"><input id="input-48219" name="title" value="Checkout reliability"></div>
    </fieldset>
    <div class="css-1q2w3e">
      <button type="submit" name="intent" value="draft">Save draft</button>
      <button type="submit" name="intent" value="publish">
        Save
      </button>
    </div>
  </form>
</main>`,
  examples: {
    css: 'button[name="intent"][value="publish"]',
    xpath: "//button[@name='intent' and normalize-space(.)='Save']",
    playwright: "page.getByRole('button', { name: 'Save', exact: true })",
  },
  hints: ['Role locators use substring matching by default for string names.'],
  solutionNotes: 'Both buttons submit the same form, and both names contain Save. `exact: true` picks the complete name. In XPath, `normalize-space(.)` allows for the formatted line break around the word Save.',
  interviewNotes: 'Explain what would happen to a click if two buttons matched. Reach for an exact user-facing name here; picking the last matching button would bind the test to the current layout. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'MDN: XPath normalize-space', url: 'https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space' },
  ],
};

export default item;
