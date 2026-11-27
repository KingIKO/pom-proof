---
title: "How do you keep test credentials safe in automated jobs?"
topic: ci-git-docker
roles: [automation, sdet, senior]
level: senior
type: tooling
oneLine: "I give trusted jobs only the test credentials they need. I keep those credentials out of untrusted code, logs, and saved files."
looksFor:
  - "Separate work you trust from pull request code you haven't approved."
  - "Give a test account only the access the job needs."
  - "Check saved files as well as logs for secrets."
  - "Plan how to replace an exposed secret and recover."
trap: "Giving untrusted pull requests credentials that can change data so they can run all the tests."
followUps:
  - question: "What would you do if a saved sign-in file appeared in the job's uploads?"
    answer: "I'd revoke the session, then restrict or remove the file. I'd check who could have seen it and limit future uploads before rerunning."
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

I keep credentials in the secret store for continuous integration (CI), which runs jobs automatically. I'd give only the job and environment that need them access. I use a dedicated account outside production with as little access as possible. I arrange to replace its secret regularly. I check what the job saves because a trace or sign-in file can contain credentials even when the log hides them.

I keep untrusted pull request code away from jobs that can read those credentials. In GitHub Actions, ordinary runs from forks don't get repository secrets, apart from the separately handled `GITHUB_TOKEN`. I give those runs safe local checks. I reserve tests that use credentials for a trusted workflow.

### Example

I replace real services with controlled responses for checks on external contributions. On protected `main`, I use a separate workflow with a secret from the `staging` environment. My test sign-in script reads it from `TEST_API_TOKEN`. If the secret is missing, I expect the step to stop before the script runs. I don't upload the saved session file.
