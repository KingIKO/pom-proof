import type { LocatorItem } from '../../types';

const item: LocatorItem = {
  id: 'delete-invoice-2041',
  kind: 'locator',
  title: 'Delete the right invoice',
  difficulty: 'Medium',
  topics: ['Locators', 'Row filters', 'XPath axes'],
  roles: ['automation', 'sdet'],
  summary: 'Scope a repeated Delete action to one invoice number.',
  prompt: 'Select the Delete button for invoice INV-2041. Leave invoice INV-20410 and the other rows untouched.',
  allow: ['css', 'xpath', 'playwright'],
  target: 'tr[data-invoice="INV-2041"] button[aria-label="Delete"]',
  html: `
<main>
  <h1>Draft invoices</h1>
  <div class="css-1q2w3e">
    <table>
      <thead><tr><th scope="col">Invoice / account</th><th scope="col">Total</th><th scope="col">Actions</th></tr></thead>
      <tbody>
        <tr data-invoice="INV-20410">
          <td data-column="invoice">INV-20410 / March Studio</td><td>$280</td>
          <td><button type="button" aria-label="Delete">Delete</button></td>
        </tr>
        <tr data-invoice="INV-2041">
          <td data-column="invoice">
            INV-2041 / Cedar Studio
          </td><td>$420</td>
          <td><div class="css-8t6v2b"><button type="button" aria-label="Delete">Delete</button></div></td>
        </tr>
        <tr data-invoice="INV-2061">
          <td data-column="invoice">INV-2061 / Fern Press</td><td>$815</td>
          <td><button type="button" aria-label="Delete">Delete</button></td>
        </tr>
      </tbody>
    </table>
  </div>
</main>`,
  examples: {
    css: 'tr[data-invoice="INV-2041"] button[aria-label="Delete"]',
    xpath: "//td[@data-column='invoice' and contains(normalize-space(.), 'INV-2041 /')]/ancestor::tr//button[@aria-label='Delete']",
    playwright: "page.getByRole('row').filter({ hasText: 'INV-2041 /' }).getByRole('button', { name: 'Delete', exact: true })",
  },
  hints: ['Identify the invoice row before looking for an action. Include the delimiter after the ID if you use substring matching.'],
  solutionNotes: 'A page-wide Delete query returns three actions. Filtering on the bare text INV-2041 also includes INV-20410. The slash delimiter distinguishes the exact invoice number in the visible text. XPath goes up from that cell to its row before looking down for Delete.',
  interviewNotes: 'For a destructive action, explain what makes the row identity unambiguous. Use an exact row key if the visible formatting is likely to change. See the Playwright locator and best-practices references.',
  sources: [
    { label: 'Playwright locators', url: 'https://playwright.dev/docs/locators' },
    { label: 'Playwright best practices', url: 'https://playwright.dev/docs/best-practices' },
    { label: 'MDN: XPath contains', url: 'https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Functions/contains' },
    { label: 'MDN: XPath axes', url: 'https://developer.mozilla.org/en-US/docs/Web/XML/XPath/Reference/Axes' },
  ],
};

export default item;
