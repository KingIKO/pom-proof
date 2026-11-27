---
title: The sample export should show four units of P218. What would you check in the download test?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Before I click Export, I'd start waiting for the download. I'd save it where only this test writes and check it against known test data.
looksFor:
  - Start waiting for the download before the action that triggers it.
  - Save the file where only this test writes.
  - Check the name the browser suggests and the data in the file.
  - Use the browser's download signal instead of opening the system's save window.
trap: Driving the system's save window or checking only whether a file exists.
followUps:
  - question: What would you check if no records match the export filter?
    answer: I'd check what the product promises. If it promises a CSV file with just a header, I'd check the column names and expect zero data rows.
sources:
  - label: Playwright download events and saved files
    url: https://playwright.dev/docs/downloads
  - label: Playwright download reference
    url: https://playwright.dev/docs/api/class-download
  - label: Playwright Python downloads
    url: https://playwright.dev/python/docs/downloads
  - label: Playwright Python download reference
    url: https://playwright.dev/python/docs/api/class-download
  - label: Playwright test output paths
    url: https://playwright.dev/docs/api/class-testinfo#test-info-output-path
  - label: Node.js file reads
    url: https://nodejs.org/api/fs.html#fspromisesreadfilepath-options
  - label: Python CSV reader
    url: https://docs.python.org/3/library/csv.html#csv.DictReader
  - label: pytest temporary paths
    url: https://docs.pytest.org/en/stable/how-to/tmp_path.html
examples:
  - title: Save and check a seeded inventory export
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { readFile } from 'node:fs/promises';
          import { expect, test } from '@playwright/test';

          test('exports seeded inventory', async ({ page }, info) => {
            await page.goto('http://localhost:3000/inventory/sample');
            const downloadPromise = page.waitForEvent('download');
            await page.getByRole('button', { name: 'Export inventory' }).click();
            const download = await downloadPromise;
            expect(download.suggestedFilename()).toBe('inventory.csv');
            const path = info.outputPath('inventory.csv');
            await download.saveAs(path);
            const lines = (await readFile(path, 'utf8')).trimEnd().split(/\r?\n/);
            expect(lines).toEqual(['sku,quantity', 'P218,4']);
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          import csv

          def test_inventory_csv(page, tmp_path):
              page.goto("http://localhost:3000/inventory/sample")
              with page.expect_download() as event:
                  page.get_by_role("button", name="Export inventory").click()
              download = event.value
              assert download.suggested_filename == "inventory.csv"
              path = tmp_path / "inventory.csv"
              download.save_as(path)
              with path.open(newline="", encoding="utf-8") as file:
                  assert list(csv.DictReader(file)) == [{"sku": "P218", "quantity": "4"}]
---

Before I click Export, I'd listen for the download event, the signal the browser sends when a download starts. That lets me catch a download that starts right away. Playwright gives me a download object I can use to check the suggested name and save the file. I'd save it to a path only this test uses so another test can't overwrite it. I can then read it without opening the system's save window.

I'd check the header and data rows against the records I set up. If the export uses a filter, I'd include a record that should stay out of the file. If the CSV, or comma-separated file, has quoted fields, I'd use a parser that reads them correctly.

### Example

I'd use a local inventory with four units of one SKU, the product code `P218`. I'd expect Export to suggest `inventory.csv`. I'd check for a header and exactly one data row with that item. The sample fields contain no commas or line breaks.
