---
title: The catalog adds a new response shape. What evidence lets its team release without waiting for the library's email service?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Prove the hold service can still read the catalog response and keep a deployed check for the actual hold and confirmation.
looksFor:
  - Uses the hold team's copy-ID expectation against the candidate catalog build.
  - Tests the last-copy rule in the hold service without involving email.
  - Uses the deployed test inbox to verify routing and permissions.
  - Watches completed holds and delayed confirmations after release.
trap: Putting every service rule through a shared staging environment before any team can release.
followUps:
  - question: The seeded book is reserved, but the test inbox gets nothing. Which passing check would you leave alone?
    answer: I'd leave the copy-ID contract alone if the hold succeeded. I'd investigate the deployed notification route and its credentials instead.
sources:
  - label: Pact consumer tests and provider verification
    url: https://docs.pact.io/getting_started/how_pact_works
---

I'd have the hold team publish the catalog response fields it uses and verify those against
the candidate catalog build. They can get that answer without reserving a shared environment
or deploying the email service. I'd check the hold service's rule for the last available copy
in its own tests, because the email system has no part in that decision.

I'd still run a deployed hold with a test inbox. A contract can't show whether a deployed service
has the credentials to send the confirmation. After release I'd monitor completed holds and
the delay until the reader gets their message.

### Example

The catalog contract checks that its availability response contains the copy ID the hold service
needs. A deployed check places a hold on a seeded book, then verifies the copy is reserved and
one confirmation reaches a test inbox.
