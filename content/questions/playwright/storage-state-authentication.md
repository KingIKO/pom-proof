---
title: How do you reuse a signed-in session in Playwright without coupling tests?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: Save test account state after sign-in, load it into fresh contexts, and separate accounts for tests that change server state.
looksFor:
  - Save and load Playwright storage state
  - Protect the saved state from the repository and artifacts
  - Separate mutable test accounts
  - Keep actual sign-in coverage
trap: Putting a state file in Git or giving every parallel worker the same mutable account.
followUps:
  - question: What happens when the saved session expires?
    answer: The setup step should obtain fresh state and confirm that sign-in succeeded before dependent tests start.
sources:
  - label: Playwright authentication
    url: https://playwright.dev/docs/auth
  - label: Playwright Python authentication
    url: https://playwright.dev/python/docs/auth
  - label: Playwright pytest context fixtures
    url: https://playwright.dev/python/docs/test-runners#fixtures
  - label: Playwright browser context storage state
    url: https://playwright.dev/docs/api/class-browsercontext#browser-context-storage-state
examples:
  - title: Check a profile in a fresh context loaded from saved state
    variants:
      - lang: ts
        label: Playwright Test (TypeScript)
        code: |
          import { expect, test } from '@playwright/test';

          test.use({ storageState: 'playwright/.auth/reader.json' });

          test('loads the reader profile without another sign-in', async ({ page }) => {
            await page.goto('http://localhost:3000/profile');
            await expect(page.getByTestId('profile-email')).toHaveText('reader@example.test');
          });
      - lang: python
        label: pytest and Playwright (Python)
        code: |
          import pytest
          from playwright.sync_api import expect

          @pytest.fixture
          def reader_page(new_context):
              context = new_context(storage_state="playwright/.auth/reader.json")
              return context.new_page()

          def test_reader_profile(reader_page):
              reader_page.goto("http://localhost:3000/profile")
              email = reader_page.get_by_test_id("profile-email")
              expect(email).to_have_text("reader@example.test")
---

I'd sign in as a test account in setup, wait until sign-in is complete, and save `storageState`. Later specs load that state into their own browser contexts. A saved state file can carry cookies or other session data, so I keep it out of source control and ordinary artifact uploads.

This can save time without sharing a live browser page. It still points at the same backend account if I reuse the same state everywhere. If tests make changes, I allocate independent accounts or data and make sure the scopes match the writes. I keep a small set of tests that exercises sign-in itself so cached state doesn't hide a broken login.

### Example

I'd let read-only order history checks share a test login. For parallel preference tests, I'd set up an account per worker and reset the relevant preferences for each test.

This local profile check uses a state file created by setup after verifying sign-in as `reader@example.test`. The fresh context should open the protected profile and display that exact account.
