---
problem: diagnosis/review-password-in-login-test
---

Mark line 3. It places a working password in versioned source in this scenario. A reader of the repository or its history could recover the value, and copying it to another source file leaves the same problem. Line 2 names a documented fixture account. Its address is public within the team by policy, so marking it would confuse an identifier with the secret that grants access.

Have CI provide the password from its secret store and pass it to the test through the existing credential fixture or a required environment variable. Fail setup clearly if the credential is missing, without printing its value. If a real password reached a commit or test artifact, revoke or rotate it and check where copies may have spread. Deleting the current line does not remove earlier copies.

The UI sign-in still belongs here because sign-in is the feature under test. Keep the limited account and the assertions after submission. In an interview, explain how local and CI jobs obtain a credential without adding it to the repository.

[OWASP: secrets management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
