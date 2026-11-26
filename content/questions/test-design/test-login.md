---
title: What would you test first on an email and password login page?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: Check that valid credentials open the right account, failed attempts leave the user signed out, and logout ends access.
looksFor:
  - Starts each case with a known account and session state.
  - Verifies whose account is open after a successful sign-in.
  - Covers missing input and rejected credentials without exposing account details.
  - Checks access to a protected page after failure and after signing out.
trap: Treating the appearance of a dashboard or an error message as proof that the session changed correctly.
followUps:
  - question: How would you test account lockout if the product uses it?
    answer: I'd ask for the threshold and recovery rule, then use a disposable account to check attempts just before and at the threshold and verify the stated recovery path.
sources:
  - label: OWASP authentication guidance, authentication responses
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
---

I'd sign in from a signed-out session with a known test account and check that I can reach the right account page. For the failure cases I'd start signed out again and try a missing field, a wrong password, and an address that isn't registered in the test environment. OWASP recommends a generic failure response. An incorrect password and an unknown address should both leave me signed out without giving away which account exists.

I'd also sign out from a successful session and revisit a protected page. The login screen alone doesn't tell me whether that page is still reachable.

### Example

A commuter portal has separate receipts for each rider. I'd sign in as the rider who has a known parking receipt and open it. After signing out, I'd reload the saved receipt URL and expect a sign-in prompt with no receipt details.
