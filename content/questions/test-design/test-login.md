---
title: What would you check first when a page asks for an email address and password?
topic: test-design
roles: [manual-qa, automation, sdet]
level: junior
type: scenario
oneLine: I'd check that the correct email and password open the right account. I'd check that a failed attempt and signing out both leave protected pages closed.
looksFor:
  - Start with a known account and check whether the browser is signed in or out.
  - Check which account opens after a successful sign-in.
  - Try missing or incorrect sign-in details and check that the error exposes no account details.
  - Try opening a protected page after a failed sign-in and again after signing out.
trap: Taking a dashboard or an error message as proof that the sign-in state is right.
followUps:
  - question: If the app uses account lockout, how would you test it?
    answer: I'd ask how many attempts trigger the lock and what restores access. I'd use an account I can discard to test just before the limit and at it. I'd check that the stated recovery steps work.
  - question: The login button looks different, but the sign-in rules are unchanged. What would you test again?
    answer: >-
      I'd rerun the test that signs in and checks that sign-out ends access.
      A service-level session check tests whether the server grants access, so it can't tell me whether keyboard focus is visible.
      I'd use a keyboard to check the changed button.
sources:
  - label: OWASP authentication guidance, authentication responses
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#authentication-responses
  - label: OWASP authentication guidance, login throttling
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html#login-throttling
  - label: OWASP session expiration and logout
    url: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html#session-expiration
---

I'd start signed out, sign in to a known test account, and check that I reach the right account page. For each failure case I'd start signed out again. I'd try a missing field, a wrong password, and an address with no account in the test environment. OWASP, a web security organization, recommends a failure message that doesn't give away which account exists. I'd check that a wrong password and an unknown address both leave me signed out without giving that away.

After a successful sign-in, I'd sign out and revisit a page that requires sign-in. Seeing the login screen alone doesn't tell me whether I can still open the protected page.

I'd check which inputs the form accepts and confirm with developers that the login code treats input as data. I'd test account lockout, which blocks sign-in after the allowed number of failures. I'd also test rate limits, which restrict how often I can try.

I'd test when the session expires with and without Remember me. I'd try the form with a keyboard and a screen reader. I'd compare response times with the team's target.

### Example

In a commuter portal with separate receipts per rider, I'd sign in as a rider with a known parking receipt. I'd open it and save its address. After signing out, I'd reload the receipt address. I'd expect a sign-in prompt that shows no receipt details.
