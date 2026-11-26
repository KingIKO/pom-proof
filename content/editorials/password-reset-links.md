---
problem: scenario/password-reset-links
---

Ask when a link expires and whether a newer request invalidates older links. Both answers change which links should work. The sender label matters to someone reading the email, but learning it does not tell you whether the service should accept a second request.

Spend five minutes on reuse and six on expiry. Open the link for a test account, complete the reset, and submit the same link with a different candidate password. Then check that valid sign-in still uses the first replacement and the second candidate was never written. Use a separate issued link for the clock check so the expired result cannot be explained by prior use.

An API integration test can exercise both the stored link state and the resulting account state; a page that shows an error could still leave a bad write behind. Cover the pure expiry comparison with a small unit table, then use the staging clock to check the service respects it. Reuse that changes the password again stops release. The decoy spends the expiry budget on a mail delivery sweep.

An interviewer wants a postcondition after the rejected attempt. The [OWASP forgot password guidance](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html) gives context for single use and expiry.
