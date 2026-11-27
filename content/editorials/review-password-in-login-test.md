---
problem: diagnosis/review-password-in-login-test
---

## What is going on

The reports reader is a test account limited to reading reports. The password literal is a password written directly in the source. The example value is fictional. In the scenario, the automated CI runs use it to sign in.

The team documents the account email as non-secret test data. The test checks sign-in through the page.

## The answer

1. Mark the password on line 3. Leave the fixture name, the email for the test account, unmarked on line 2.

   **Why:** Anyone who can read the repository can read a password committed to the source or saved in its history. Moving it to another source file leaves it exposed. Team policy already shares the email address, and the address alone grants no access.

2. Block the merge because the test stores a working account password in source code.

   Have CI supply it from its secret store through the credential fixture, reusable test setup for signing in. Another option is a required environment variable, a setting CI passes to the test process. If the password is missing, fail setup with a clear message. Never print the password.

   If a real password reached a commit or a saved test artifact, revoke it or replace it. Check where else copies may have spread.

   **Why:** The test only needs the password when it runs. The secret store supplies it without distributing it in source or logs. Deleting the current line leaves earlier copies intact.

## Why the tempting answer fails

The decoy correctly treats the password on line 3 as secret. It also incorrectly marks the approved email on line 2. Keep the page sign-in and the checks for the URL and heading after the form submits. If the page starts with the user already signed in, the test skips the flow it is supposed to check. The account can stay limited to reports access.

## What the interviewer listens for

Explain how local runs and CI runs get the password without committing it. Say what you would do if the password is already in source history or saved test output.

## Sources

- [OWASP: secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
