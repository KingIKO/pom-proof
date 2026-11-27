---
title: How would you reuse a Playwright sign-in and still let tests run independently?
topic: playwright
roles: [automation, sdet]
level: mid
type: tooling
oneLine: I'd load saved sign-in data into fresh browser contexts. If tests change server data, I'd give them separate accounts or records.
looksFor:
  - Save and load the browser data Playwright needs for the session.
  - Keep the saved file out of Git and ordinary test uploads.
  - Give tests that change data separate accounts or records.
  - Keep tests that actually sign in.
trap: Checking the saved file into Git or letting every parallel worker change the same account.
followUps:
  - question: How would you handle a saved sign-in that expired?
    answer: I'd have setup sign in again and save fresh browser data. I'd make sure sign-in succeeded before running the tests that need it.
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

I'd sign in as a test account during setup. Once sign-in finishes, I'd save `storageState`, Playwright's saved browser data. I'd load it into each test's own browser context, a group of pages that shares browser data. The saved file can contain cookies or other details that keep the session signed in. I'd keep it out of source control and ordinary test uploads.

This can save me time without sharing an open browser page. If I reuse the same file everywhere, the server still sees the same account. If tests make changes, I'd separate accounts or records based on what each test changes. I'd keep a small set of sign-in tests so a saved session can't hide a broken login.

### Example

I'd let order history tests share a login if they only read data. If preference tests run at the same time, I'd give each worker process an account. I'd reset the preferences each test uses.

For the local profile check, I'd verify sign-in as `reader@example.test` before saving the file. I'd load it into a fresh context and open the profile that requires sign-in. I'd check that the profile shows that exact account.
