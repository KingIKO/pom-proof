---
title: How would you test a role change for someone who is already signed in?
topic: test-design
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: Define when the new permissions take effect, then use controlled accounts to verify old and new sessions against both denied and retained actions.
looksFor:
  - Establishes the role matrix and when a saved change takes effect.
  - Uses an existing session and a fresh session for the changed account.
  - Verifies the actual action outcome and that no unauthorized change is saved.
  - Uses controls to show that permitted actions and unaffected accounts still work.
trap: Concluding the permission is gone because the publish button disappears after signing out and back in.
followUps:
  - question: What would you do if the product has an agreed propagation window?
    answer: I'd measure from the event the policy names, check behavior during the window against that policy, and verify denial by the agreed end. I'd record when both the administrative change and the denial were observed.
  - question: What would you still want to prove if the open page hides the button?
    answer: I'd check the service response for a test account on the documented interface and confirm the record stayed unchanged. Hiding a button doesn't prove the permission was enforced there.
sources:
  - label: OWASP authorization guidance, validate permissions on every request
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request
---

I'd write down which actions the person loses, which they keep, and when the change is supposed to take effect. In a test environment I'd open a session for the affected account before the change and a fresh one afterward. I'd check the outcomes at the service as well as in the interface. I'd also use an unaffected account as a control so a system-wide failure doesn't look like a successful revocation.

I'd ask who can answer questions about delayed updates and make the timing expectation part of the test. The app should enforce the agreed rule even if an already-open page hasn't caught up visually.

### Example

A newsroom requires an editor demoted to reader to lose publish access as soon as the administrator sees the role change confirmed. I'd check that attempts to publish a test draft from the old and new sessions are denied and that the draft stays private. The demoted user should still be able to read, and an unchanged editor should still be able to publish.
