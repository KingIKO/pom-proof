---
title: Review credentials in a login test
kind: diagnosis
topic: test-code-review
difficulty: easy
minutes: 5
roles: [automation, sdet]
items:
  - id: review
    type: line-marking
    prompt: "Mark every line with a problem."
    lines:
      - { id: l01, text: "import { expect, test } from '@playwright/test';" }
      - { id: l02, text: "const account = 'reports.qa@example.test';" }
      - { id: l03, text: "const password = 'example-only-report-login-3';" }
      - { id: l04, text: "test('reports reader can sign in', async ({ page }) => {" }
      - { id: l05, text: "  await page.goto('/sign-in');" }
      - { id: l06, text: "  const form = page.getByRole('form', { name: 'Sign in' });" }
      - { id: l07, text: "  await form.getByLabel('Email').fill(account);" }
      - { id: l08, text: "  await form.getByLabel('Password').fill(password);" }
      - { id: l09, text: "  await form.getByRole('button', { name: 'Sign in' }).click();" }
      - { id: l10, text: "  await expect(page).toHaveURL(/\\/reports$/);" }
      - { id: l11, text: "  await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();" }
      - { id: l12, text: "});" }
  - id: category
    type: single-choice
    prompt: "Which issue should stop this change from being merged?"
    choices:
      - { id: login, text: "The test signs in through the UI, even though sign-in is the behavior under test." }
      - { id: secrets, text: "An account password is stored in the test's source code." }
      - { id: check, text: "The test checks both the destination URL and the page heading." }
      - { id: role, text: "The account has read access rather than admin access." }
reference:
  review: [l03]
  category: secrets
decoy:
  review: [l02, l03]
  category: secrets
---

The reports reader is a least-privilege test account, which means it has only the access it needs. Its email address is a documented test fixture name and is not secret. In this pull request (PR), the password written in the code stands for a working CI credential. The value shown here is made up. The sign-in flow is the behavior under test.
