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
  - label: GitHub Actions push filters
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchesbranches-ignore
  - label: GitHub Actions deployment environment protections
    url: https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments
  - label: GitHub Actions checkout
    url: https://github.com/actions/checkout/tree/v7
  - label: GitHub Actions Node setup
    url: https://github.com/actions/setup-node/tree/v7
  - label: npm test scripts
    url: https://docs.npmjs.com/cli/v11/commands/npm-run
examples:
  - title: Supply a staging token only to the integration step
    variants:
      - lang: yaml
        label: GitHub Actions (YAML)
        code: |
          name: Staging sign-in check
          on:
            push:
              branches: [main]
          permissions:
            contents: read
          jobs:
            sign-in:
              runs-on: ubuntu-latest
              environment: staging
              steps:
                - uses: actions/checkout@v7
                  with:
                    persist-credentials: false
                - uses: actions/setup-node@v7
                  with:
                    node-version: '24'
                - run: npm ci
                - run: |
                    test -n "$TEST_API_TOKEN"
                    npm run test:staging
                  shell: bash
                  env:
                    TEST_API_TOKEN: ${{ secrets.STAGING_QA_TOKEN }}
---

I put test credentials in the CI secret store and scope them to the job and environment that need them. I use a dedicated nonproduction account with the least access needed and arrange rotation. I also check what the tests upload. A trace or saved sign-in state can contain credentials even if the console masks the secret value.

I keep untrusted pull request code away from jobs that have access to the credentials. On GitHub Actions, normal fork pull request runs don't receive the repository's secrets apart from the separately handled `GITHUB_TOKEN`. I give those runs safe local checks. I reserve credentialed integration runs for a trusted execution path.

### Example

I run mocked checks on external contributions. On protected `main`, this separate workflow uses the `staging` environment's scoped secret for a synthetic sign-in script that reads `TEST_API_TOKEN`. A missing secret should fail the step before the script runs. The job never uploads the saved session file.
