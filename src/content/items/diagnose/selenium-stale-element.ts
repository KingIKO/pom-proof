import type { DiagnoseItem } from '../../types';

const item: DiagnoseItem = {
  id: 'selenium-stale-element',
  title: 'Diagnose a stale invoice row',
  kind: 'diagnose',
  difficulty: 'Medium',
  topics: ['Selenium', 'Flaky tests', 'Wait strategies'],
  roles: ['automation', 'sdet'],
  summary: 'Trace a stale element exception to the lifetime of a WebElement reference.',
  prompt: 'The invoice table replaces its rows after filtering. The selected invoice remains visible after the update. Read the Selenium snippet and runtime log, then choose the cause and the repair.',
  lang: 'java',
  code: `
By invoiceLink = By.cssSelector("[data-invoice='INV-52'] a");
WebElement link = driver.findElement(invoiceLink);
driver.findElement(By.id("show-open")).click();
wait.until(ExpectedConditions.textToBe(By.id("filter-state"), "Open invoices"));
link.click();`,
  log: `[113 ms] findElement invoice INV-52: element id e.17
[147 ms] filter click accepted
[279 ms] table rows replaced; INV-52 rendered with element id e.64
[280 ms] filter-state: Open invoices
[289 ms] org.openqa.selenium.StaleElementReferenceException
stale element reference: element is not attached to the page document
Command: clickElement {id=e.17}`,
  questions: [
    {
      prompt: 'Why does the last click throw?',
      options: [
        { text: 'The CSS selector becomes invalid after filtering.', why: 'The failure occurs while clicking an existing reference, not while evaluating a selector.' },
        { text: 'The new row is present but covered by the filter control.', why: 'A blocked click would point to interception; the log shows a detached element reference.' },
        { text: 'The test holds the original link after the table replaced its DOM node.', correct: true, why: 'Selenium clicks e.17, while the invoice displayed after the update is a different element, e.64.' },
        { text: 'The filter-state wait never completed.', why: 'The next command reached the final click, and the log records the expected filter text.' },
      ],
    },
    {
      prompt: 'What is the best repair for this update?',
      options: [
        { text: 'Wait for update completion, then find a clickable link using invoiceLink and click that result.', correct: true, why: 'A locator-based wait resolves a live element after the known re-render rather than reusing e.17.' },
        { text: 'Sleep after the update and click link again.', why: 'A delay never reconnects a reference to a replaced DOM node.' },
        { text: 'Wait for link to be clickable using the original WebElement.', why: 'That still uses the stale reference. Pass the locator so the lookup can find the new node.' },
        { text: 'Catch the exception and let the test finish.', why: 'The test could pass without ever opening the invoice.' },
      ],
    },
  ],
  hints: ['Compare the element IDs before and after filtering.', 'Separate a reusable By locator from the WebElement it returns.'],
  solutionNotes: 'Store the locator, wait for the completed filter, then call `wait.until(ExpectedConditions.elementToBeClickable(invoiceLink)).click()`. Assert that invoice `INV-52` opened.',
  interviewNotes: 'Use the trace to name the exact DOM transition. If rendering can repeat during the click, ask for a reliable way to tell that the table is ready for input.',
  sources: [
    { label: 'Selenium: Stale element reference errors', url: 'https://www.selenium.dev/documentation/webdriver/troubleshooting/errors/#staleelementreferenceexception' },
    { label: 'Selenium: Waiting strategies', url: 'https://www.selenium.dev/documentation/webdriver/waits/' },
  ],
};

export default item;
