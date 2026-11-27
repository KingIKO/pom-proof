---
title: How would you test a role change for someone who's already signed in?
topic: test-design
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: I'd agree on when the new permissions take effect. I'd check what test accounts can do in sessions that started before and after the change.
looksFor:
  - List what each role can do and when a saved role change takes effect.
  - Test the changed account with an existing sign-in and a new one.
  - Check whether the service rejects the action and leaves the record unchanged.
  - Check that actions still work for the changed account where allowed and for accounts whose roles didn't change.
trap: Assuming publishing is blocked because the button disappears after you sign out and sign back in.
followUps:
  - question: How would you test a role change if the product has an agreed propagation window?
    answer: I'd start timing from the event the policy names. I'd check the account's actions against that policy during the propagation window, the time allowed for the change to take effect. I'd verify that the service denies the action by the agreed end. I'd record when I saw the admin change and when I saw the denial.
  - question: If the open page hides the button, what would you still check?
    answer: I'd check the documented service response for a test account. I'd confirm the record stayed unchanged. If the page hides a button, that alone doesn't show that the service enforces the permission.
sources:
  - label: OWASP authorization guidance, validate permissions on every request
    url: https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html#validate-the-permissions-on-every-request
---

I'd write down which actions the person loses and which they keep. I'd agree on when the change should take effect. In a test environment, I'd sign in as that account before the change and start a fresh session afterward. I'd check what happens at the service and in the interface. I'd also check an account whose role didn't change so a service failure doesn't look like the role change worked.

I'd find out who can answer questions about delays and include the expected timing in the test. I'd expect the app to enforce that rule even if the open page hasn't updated yet.

### Example

Suppose a newsroom changes an editor's role to reader. As soon as the administrator sees confirmation, I'd expect that account to lose publishing access. I'd check that neither its old nor its new session can publish a test draft. I'd check that the draft stays private and that the new reader can still read. I'd expect an editor whose role didn't change to still be able to publish.
