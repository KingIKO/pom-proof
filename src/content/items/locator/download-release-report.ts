import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'download-release-report',
  kind: 'locator',
  title: 'Download the CSV report',
  difficulty: 'Easy',
  topics: ['Locators', 'CSS attribute selectors'],
  roles: ['automation', 'sdet'],
  summary: 'Pick the download link for one export format.',
  prompt: 'Select the CSV download link in Release reports. Leave the CSV preview and the PDF download alone. Use CSS only.',
  allow: ['css'],
  target: 'a[download][data-format="csv"]',
  html: `
<main>
  <h1>Release reports</h1>
  <div class="css-1q2w3e">
    <a class="css-6p8z1k" href="/preview/release.csv" data-format="csv">Preview CSV</a>
  </div>
  <div class="css-1q2w3e">
    <a class="css-6p8z1k" href="/exports/artifact-48213" data-format="pdf" download>Download PDF</a>
    <a class="css-6p8z1k" href="/exports/artifact-48214" data-format="csv" download>Download CSV</a>
  </div>
</main>`,
  examples: { css: 'a[download][data-format="csv"]' },
  hints: ['The preview shares the format attribute. Look for an attribute that only downloads have.'],
  solutionNotes: 'The `download` attribute separates download links from previews. Pair it with the CSV format. The same generated class appears on all three links, and the artifact URL can change for each release.',
  interviewNotes: 'Explain why the download and format attributes describe what the link does. In a Playwright suite, the named link is another option if the text is part of the feature contract. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'MDN: Attribute selectors', url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/Attribute_selectors' },
  ],
};

export default item;
