---
title: Test data
module: framework-design
order: 4
level: core
summary: Give each test the records it needs in a known state. Use a builder or a named example to keep the important values visible.
minutes: 3
prerequisites: [automation-fundamentals/test-independence]
outcomes:
  - Choose between a test data builder and an object mother.
  - Create a record through an API and clean it up by its own ID.
useWhen:
  - A browser test needs a record to exist before its first user action.
  - Cases need variations on the same kind of record.
avoidWhen:
  - Two tests can change the same preloaded record.
  - The browser steps you would skip are the behaviour you need to check.
practiceTopics: [test-isolation]
questionTopics: [framework-design, automation-strategy]
examples:
  - title: Seed an archived report and check it in the browser
    variants:
      - lang: ts
        label: Playwright Test
        code: |
          import { randomUUID } from 'node:crypto';
          import { test, expect } from '@playwright/test';

          type ReportInput = {
            title: string;
            status: 'draft' | 'archived';
            reference: string;
          };

          function buildReport(overrides: Partial<Omit<ReportInput, 'reference'>> = {}): ReportInput {
            return {
              title: 'April revenue',
              status: 'draft',
              ...overrides,
              reference: randomUUID(),
            };
          }

          // Set baseURL to the test app that accepts ReportInput and returns { id }.
          test('shows the status of an archived report', async ({ request, page }) => {
            const data = buildReport({ status: 'archived' });
            const created = await request.post('/api/reports', { data });
            await expect(created).toBeOK();
            const { id } = await created.json();

            let checked = false;
            try {
              await page.goto(`/reports/${id}`);
              await expect(page.getByRole('status')).toHaveText('Archived');
              checked = true;
            } finally {
              try {
                const deleted = await request.delete(`/api/reports/${id}`);
                if (!deleted.ok()) throw new Error(`Delete failed: ${deleted.status()}`);
              } catch (error) {
                if (checked) throw error;
                console.warn('Report cleanup also failed:', error);
              }
            }
          });
sources:
  - { label: "Selenium: Generating application state", url: "https://www.selenium.dev/documentation/test_practices/encouraged/generating_application_state/", type: primary }
  - { label: "Playwright: Best practices", url: "https://playwright.dev/docs/best-practices", type: primary }
  - { label: "Nat Pryce: Test Data Builders (archived copy)", url: "https://web.archive.org/web/20250207051618/http://www.natpryce.com/articles/000714.html", type: practitioner }
  - { label: "Martin Fowler: Object Mother", url: "https://martinfowler.com/bliki/ObjectMother.html", type: practitioner }
---
## What it is

Test data includes the values you pass into code and the records an app needs before a test starts. For example, a test that checks an archived report needs a report whose status is already archived. Seeding means adding that starting data to the app before the test uses it.

## How it works

In Nat Pryce's test data builder pattern, a helper makes a new object from sensible defaults. The test overrides the fields that matter to its case. An object mother gives standard examples names, such as `anArchivedReport()`. Its methods make fresh objects from familiar recipes.

When a record needs to exist on the server, seed it through an API. An API lets test code send requests directly to the app without using its screens. The example assumes a test app that accepts a report through `POST /api/reports` and returns its ID. The test uses that ID to open the report and delete only that record afterwards.

## Why it helps

A builder keeps the detail under test visible. In the example, `status: 'archived'` explains why the test expects to see `Archived`. A named recipe can be clearer when a whole scenario has a name the team already knows.

Selenium recommends using existing APIs to prepare data. Skipping unrelated form steps removes places where a browser test can fail before it reaches the behaviour it checks. Playwright recommends that each test have its own data and that you control the database state in the test environment.

## When not to use it

If the test checks report creation through the browser, create the report there. Use the API for other records that the creation flow needs.

If a record needs only a few fields, writing them in the test may be clearer than adding a builder. A change to a standard recipe can break many tests if they rely on its exact values.

Share read-only reference data, such as a list of currencies. If a test edits a record, give it its own copy so runs can overlap safely. Generate a fresh reference each time you create a record so two runs can use the same scenario without reusing its data.
