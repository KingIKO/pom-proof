import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'edit-on-call-responder',
  kind: 'locator',
  title: 'Edit Iris Bell’s on-call assignment',
  difficulty: 'Medium',
  topics: ['Locators', 'XPath axes', 'Tables'],
  roles: ['automation', 'sdet'],
  summary: 'Use a responder’s name cell to find the Edit action in the same row.',
  prompt: 'Select the Edit button for Iris Bell in the on-call roster. Iris Bell Jr. is a different responder. Use XPath only.',
  allow: ['xpath'],
  target: 'tr[data-rotation="weekday-primary"] button[data-action="edit"]',
  html: `
<main>
  <h1>On-call roster</h1>
  <div class="css-1q2w3e">
    <table>
      <caption>Next rotation</caption>
      <thead><tr><th scope="col">Responder</th><th scope="col">Shift</th><th scope="col">Actions</th></tr></thead>
      <tbody>
        <tr data-rotation="weekend-primary">
          <td>Iris Bell Jr.</td><td>Weekend</td>
          <td data-column="actions"><div class="css-7v6c4n"><button type="button" data-action="edit">Edit</button></div></td>
        </tr>
        <tr data-rotation="weekday-primary">
          <td>
            Iris Bell
          </td><td>Weekday</td>
          <td data-column="actions"><div class="css-7v6c4n"><button type="button" data-action="edit">Edit</button></div></td>
        </tr>
        <tr data-rotation="weekend-backup">
          <td>Nora Reed</td><td>Weekend backup</td>
          <td data-column="actions"><div class="css-7v6c4n"><button type="button" data-action="edit">Edit</button></div></td>
        </tr>
      </tbody>
    </table>
  </div>
</main>`,
  examples: { xpath: "//td[normalize-space(.)='Iris Bell']/following-sibling::td[@data-column='actions']//button[text()='Edit']" },
  hints: ['Find the name cell first. The actions cell is a following sibling in the same row.'],
  solutionNotes: 'Normalize the name cell to remove the line break and indentation. Exact equality excludes Iris Bell Jr. The `following-sibling` axis stays in the row, and the descendant step reaches the Edit button inside its wrapper. Here `text()` works for the button because Edit is a direct text node.',
  interviewNotes: 'Explain why `following-sibling` stays within the row but `following` could select actions in later rows. If the button copy were wrapped in a span, `normalize-space(.)` would account for descendant text as well. See the Playwright locator and best-practices references for role-based alternatives.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'MDN: XPath axes', url: 'https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes' },
    { label: 'MDN: XPath normalize-space', url: 'https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/normalize-space' },
  ],
};

export default item;
