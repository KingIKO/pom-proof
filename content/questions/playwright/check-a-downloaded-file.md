---
title: The sample export should contain four units of P218. What does the download test need to prove?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Register the download wait before the click, save to a unique test path, and check the file against seeded data.
looksFor:
  - Attaches the event wait before the triggering action.
  - Saves to a path owned by the test.
  - Checks the suggested name and actual data.
  - Uses the download event rather than driving a desktop dialog.
trap: Automating the desktop save dialog or checking only that some file exists.
followUps:
  - question: How would you test a filtered export that has no matching records?
    answer: I'd check the product contract first. If it promises a CSV with only a header, I'd check the column names and assert zero data rows.
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

I'd start waiting for the download event before clicking Export. That catches a file that arrives immediately. Once I have the download object, I'd check the suggested filename and save it to a test-owned path. I can read it there without opening an operating system dialog, and I won't collide with another test's output.

I'd check the header and rows against data I seeded, including a record that should be excluded when the export is filtered. For more complex CSV data I'd use a parser to handle quoted fields.

### Example

The local sample inventory contains one SKU, `P218`, with four units. Export should suggest `inventory.csv` and produce a header plus exactly that row. The sample fields contain no commas or line breaks.
