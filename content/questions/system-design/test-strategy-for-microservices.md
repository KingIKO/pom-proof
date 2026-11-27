---
title: The catalog adds a new reply format. What evidence lets its team release without waiting for the library's email service?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: I'd check that the hold service can still read the catalog reply. I'd keep a deployed test for placing a hold and receiving confirmation.
looksFor:
  - Check the catalog build against what the hold team expects for the copy ID.
  - Test the rule for the last available copy without sending email.
  - Use a test inbox to check where the deployed service sends email and whether it has permission.
  - After release, track completed holds and late confirmations.
trap: Making every team test every rule in a shared test environment before releasing.
followUps:
  - question: The test book is reserved, but the confirmation never arrives. Which passing check would you leave alone?
    answer: If the hold succeeds, I'd leave the check for the copy ID alone. I'd check where the deployed service sends the confirmation and how it signs in to send it.
sources:
  - label: Pact consumer tests and provider verification
    url: https://docs.pact.io/getting_started/how_pact_works
---

I'd have the hold team publish which fields it reads from the catalog reply. I'd check that contract, the agreement about those fields, against the catalog build planned for release. I can do that without booking time in a shared test environment or deploying the email service. I'd test the rule for the last available copy in the hold service itself. The email service plays no part in that decision.

I'd still place a hold in a deployed test environment and use a test inbox. A contract doesn't show whether the deployed service can sign in and send a confirmation. After release, I'd watch how many holds complete. I'd track how long readers wait for their confirmations.

### Example

I'd use the contract to check that the catalog's availability reply includes the copy ID the hold service needs. In a deployed test, I'd place a hold on a book I set up. I'd check that the service reserves the copy and that exactly one confirmation reaches the test inbox.
