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
---

I'd sign in as a test account in setup, wait until sign-in is complete, and save `storageState`. Later specs load that state into their own browser contexts. A saved state file can carry cookies or other session data, so I keep it out of source control and ordinary artifact uploads.

This can save time without sharing a live browser page. It still points at the same backend account if I reuse the same state everywhere. If tests make changes, I allocate independent accounts or data and make sure the scopes match the writes. I keep a small set of tests that exercises sign-in itself so cached state doesn't hide a broken login.

### Example

I'd let read-only order history checks share a test login. For parallel preference tests, I'd set up an account per worker and reset the relevant preferences for each test.
