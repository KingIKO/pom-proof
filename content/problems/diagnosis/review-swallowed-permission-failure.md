---
title: Review a permission test that passes on failure
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
      - { id: l03, text: "test('blocks analyst from removing members', async ({ analystPage }) => {" }
      - { id: l04, text: "  await analystPage.goto('/workspace/members/m20');" }
      - { id: l05, text: "  await expect(analystPage.getByRole('heading', { name: 'Member details' })).toBeVisible();" }
      - { id: l06, text: "  const remove = analystPage.getByRole('button', { name: 'Remove member' });" }
      - { id: l07, text: "  try {" }
      - { id: l08, text: "    await remove.click();" }
      - { id: l09, text: "    await expect(analystPage.getByRole('alert')).toHaveText('Permission denied');" }
      - { id: l10, text: "  } catch (error) {" }
      - { id: l11, text: "    console.warn('Could not check member removal', error);" }
      - { id: l12, text: "  }" }
      - { id: l13, text: "});" }
  - id: category
    type: single-choice
    prompt: "What can cause a false pass here?"
    choices:
      - { id: message, text: "The suite expects a visible permission message from a denied action." }
      - { id: access, text: "The test uses the analyst fixture instead of an admin page." }
      - { id: locator, text: "The test uses button and alert roles instead of selectors." }
      - { id: suppression, text: "The catch converts a failed interaction or assertion into a log message and lets the test pass." }
reference:
  review: [l11]
  category: suppression
decoy:
  review: [l09]
  category: message
---

Product requirements call for a visible removal button, then a `Permission denied` alert when an analyst presses it. The analyst fixture seeds and owns member `m20`. Mark the statement that turns a thrown error into a pass; do not mark the surrounding control-flow syntax.
