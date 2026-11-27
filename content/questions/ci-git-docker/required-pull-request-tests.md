---
title: "How would you run tests on every pull request and require them to pass before merge?"
topic: ci-git-docker
roles: [manual-qa, automation, sdet]
level: junior
type: tooling
oneLine: "I run a small set of tests the same way on each pull request. I require that check to pass before anyone can merge."
looksFor:
  - "Show what starts the test run when a pull request changes."
  - "Use settings and package versions another run can recreate."
  - "Explain the difference between starting a workflow and requiring its result."
  - "Make the failure easy for the contributor to investigate."
trap: "Assuming a check blocks merges just because it runs automatically."
followUps:
  - question: "How would you prove a failing check prevents a merge?"
    answer: "I'd open a test pull request with a check that fails on purpose. I'd confirm GitHub blocks the merge. Then I'd restore the check."
sources:
  - label: GitHub Actions pull request event
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request
  - label: GitHub protected branches
    url: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
  - label: GitHub Actions checkout
    url: https://github.com/actions/checkout/tree/v7
  - label: GitHub Actions Node setup
    url: https://github.com/actions/setup-node/tree/v7
  - label: npm clean install
    url: https://docs.npmjs.com/cli/v11/commands/npm-ci
  - label: npm test scripts
    url: https://docs.npmjs.com/cli/v11/commands/npm-run
examples:
  - title: Give checkout its own required check
    variants:
      - lang: yaml
        label: GitHub Actions (YAML)
        code: |
          name: Pull request tests
          on: [pull_request]
          permissions:
            contents: read
          jobs:
            checkout:
              name: Checkout tests
              runs-on: ubuntu-latest
              steps:
                - uses: actions/checkout@v7
                - uses: actions/setup-node@v7
                  with:
                    node-version: '24'
                - run: npm ci
                - run: npm run test:unit
                - run: npm run test:order-smoke
---

On GitHub I'd start a workflow on the `pull_request` event, which runs when a pull request is opened or updated. I'd install the saved package versions and run the same command contributors can run locally. I'd start with fast checks for important actions. If an assertion, a check for an expected result, fails, I'd make sure the job fails too. The output should tell the author which test failed and how to repeat it.

I'd make that result a required check on the branch that receives the change. Starting a workflow and requiring its result are separate settings. I'd try a small change that fails and confirm I can proceed again after the check passes.

### Example

Suppose my repository saves exact Node package versions and has a quick order test against a local service. I'd require the `Checkout tests` check. A checkout change runs unit tests, which test small parts of the code, and the quick order check. If order confirmation fails, I'd expect the job to fail and GitHub to block the merge.
