---
title: Review a saved search shared across tests
kind: diagnosis
topic: test-code-review
difficulty: hard
minutes: 7
roles: [automation, sdet, senior]
items:
  - id: review
    type: line-marking
    prompt: "Mark every line with a problem."
    lines:
      - { id: l01, text: "import { expect } from '@playwright/test';" }
      - { id: l02, text: "import { test } from './fixtures';" }
      - { id: l03, text: "let searchId: string;" }
      - { id: l04, text: "test('shares a saved search', async ({ page, searches }) => {" }
      - { id: l05, text: "  const { id } = await searches.create({ query: 'linen' });" }
      - { id: l06, text: "  searchId = id;" }
      - { id: l07, text: "  await page.goto(`/searches/${id}`);" }
      - { id: l08, text: "  await page.getByRole('button', { name: 'Share search' }).click();" }
      - { id: l09, text: "  await expect(page.getByRole('status')).toHaveText('Search shared');" }
      - { id: l10, text: "});" }
      - { id: l11, text: "test('removes a saved search', async ({ page }) => {" }
      - { id: l12, text: "  await page.goto(`/searches/${searchId}`);" }
      - { id: l13, text: "  await page.getByRole('button', { name: 'Remove search' }).click();" }
      - { id: l14, text: "  await expect(page.getByRole('status')).toHaveText('Search removed');" }
      - { id: l15, text: "});" }
  - id: category
    type: single-choice
    prompt: "Why does the removal test fail when it runs on its own?"
    choices:
      - { id: isolation, text: "The removal test gets its record ID from an earlier test rather than its own setup." }
      - { id: persistence, text: "An account can remove searches only after a browser context has been reused." }
      - { id: heading, text: "The test should find the success message by its heading role, not its status role." }
      - { id: coverage, text: "The file uses two separate tests for actions that touch the same feature." }
reference:
  review: [l03, l06, l12]
  category: isolation
decoy:
  review: [l03, l12]
  category: isolation
---

Both tests use pages that are already signed in. Each test is meant to run on its own in CI. A fixture is a helper that Playwright sets up and passes to a test. The `searches` test fixture creates records and cleans them up when the test ends. A browser context is an isolated browser session with its own cookies.

Mark the statements that create the dependency between the tests or use it. Leave the test declarations unmarked.
