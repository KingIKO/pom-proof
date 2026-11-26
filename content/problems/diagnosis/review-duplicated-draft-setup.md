---
title: Review repeated setup for draft reports
kind: diagnosis
topic: test-code-review
difficulty: medium
minutes: 6
roles: [automation, sdet, senior]
items:
  - id: review
    type: line-marking
    prompt: "Mark every line with a problem."
    lines:
      - { id: l01, text: "import { expect } from '@playwright/test';" }
      - { id: l02, text: "import { test } from './fixtures';" }
      - { id: l03, text: "test('renames a new draft', async ({ page, reports }) => {" }
      - { id: l04, text: "  const draft = await reports.seed({ name: 'April revenue', status: 'draft' });" }
      - { id: l05, text: "  await page.goto(`/reports/${draft.id}`);" }
      - { id: l06, text: "  await page.getByLabel('Report name').fill('Q2 revenue');" }
      - { id: l07, text: "  await page.getByRole('button', { name: 'Save name' }).click();" }
      - { id: l08, text: "  await expect(page.getByRole('heading', { name: 'Q2 revenue' })).toBeVisible();" }
      - { id: l09, text: "});" }
      - { id: l10, text: "test('archives a new draft', async ({ page, reports }) => {" }
      - { id: l11, text: "  const draft = await reports.seed({ name: 'April revenue', status: 'draft' });" }
      - { id: l12, text: "  await page.goto(`/reports/${draft.id}`);" }
      - { id: l13, text: "  await page.getByRole('button', { name: 'Archive draft' }).click();" }
      - { id: l14, text: "  await expect(page.getByRole('status')).toHaveText('Draft archived');" }
      - { id: l15, text: "});" }
  - id: category
    type: single-choice
    prompt: "Which problem violates the suite's setup convention?"
    choices:
      - { id: shared, text: "Both tests mutate the same report on the server." }
      - { id: repeat, text: "The tests repeat draft seed and navigation steps already provided by a test-scoped fixture." }
      - { id: no-assert, text: "The tests perform mutations without asserting their effects." }
      - { id: hidden, text: "The suite hides the user actions inside a helper." }
reference:
  review: [l04, l05, l11, l12]
  category: repeat
decoy:
  review: [l04, l11]
  category: repeat
---

The suite already has a test-scoped `openedDraft` fixture for this exact start state: it creates a fresh `April revenue` draft and opens its details page. The team uses it for unrelated actions that begin there. `reports.seed` otherwise creates a fresh ID per call and handles cleanup. Mark the duplicate setup statements, leaving fixture parameter changes unmarked.
