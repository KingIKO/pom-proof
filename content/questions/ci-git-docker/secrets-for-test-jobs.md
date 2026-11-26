---
title: How do you handle credentials for tests that run in CI?
topic: ci-git-docker
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: Give trusted jobs scoped test credentials and keep untrusted code, logs, and artifacts away from them.
looksFor:
  - Separation of trusted and untrusted workflow execution
  - Least privilege and a nonproduction credential
  - Secret exposure can occur in artifacts as well as logs
  - A rotation and recovery plan
trap: Giving a pull request write-capable credentials so external contributions can run the full integration suite.
followUps:
  - question: What would you do if a session file appeared in an artifact?
    answer: I'd revoke the session, restrict or remove the artifact, check exposure, and narrow future uploads before retrying.
sources:
  - label: GitHub Actions secrets
    url: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
  - label: GitHub Actions secure use
    url: https://docs.github.com/en/actions/reference/security/secure-use
  - label: Playwright authentication state
    url: https://playwright.dev/docs/auth
---

I put test credentials in the CI secret store and scope them to the job and environment that need them. I use a dedicated nonproduction account with the least access needed and arrange rotation. I also check what the tests upload. A trace or saved sign-in state can contain credentials even if the console masks the secret value.

I keep untrusted pull request code away from jobs that have access to the credentials. On GitHub Actions, normal fork pull request runs don't receive the repository's secrets apart from the separately handled `GITHUB_TOKEN`. I give those runs safe local checks. I reserve credentialed integration runs for a trusted execution path.

### Example

I can test a mocked application on external contributions and use a protected staging job for a synthetic sign-in. The staging job never uploads the saved session file.
