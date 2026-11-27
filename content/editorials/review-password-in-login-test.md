---
problem: diagnosis/review-password-in-login-test
---

## What is going on

The reports reader is a limited test account. The scenario treats the password literal as a working CI credential, even though the displayed value is fictional. The team documents the fixture email as a non-secret, and the test is meant to exercise sign-in through the UI.

## The answer

1. Mark line 3, the password literal, and keep the fixture name on line 2.

   **Why:** A repository reader can recover a committed password from the source or its history. Moving the literal to another source file would leave the same exposure. The address identifies the account, and team policy already makes it available without granting access.

2. Block the merge for storing a password in test source. Have CI pass it from its secret store through the credential fixture or a required environment variable. Fail setup clearly if it is missing and never print its value.

   **Why:** The test needs a credential at runtime, and the repository need not distribute it. If a real password already reached a commit or test artifact, revoke or rotate it and check where copies spread. Removing the current line leaves earlier copies intact.

## Why the tempting answer fails

The decoy correctly classifies the secret and marks line 3, but also marks the approved account identifier on line 2. Keep UI sign-in and the post-submit URL and heading checks: replacing sign-in with a preauthenticated page would skip the feature being tested. The account can stay limited to reports access.

## What the interviewer listens for

Explain how local and CI runs obtain the credential without committing it, and what to do if it already escaped into history or artifacts.

## Sources

- [OWASP: secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
