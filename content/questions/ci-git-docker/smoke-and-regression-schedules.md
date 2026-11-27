---
title: "Which tests belong on every pull request, and which should run on a schedule?"
topic: ci-git-docker
roles: [manual-qa, automation, sdet, senior]
level: mid
type: scenario
oneLine: "Before merge, I run fast checks on actions that must work. I schedule broader tests and name who handles failures."
looksFor:
  - "Give a realistic time budget for pull request checks."
  - "Pick tests based on what it would cost to find the bug later."
  - "Name who handles failures in nightly runs or builds nearing release."
  - "Explain what the team does when a scheduled check fails."
trap: "Running expensive tests overnight without saying who reads their results or what they can block."
followUps:
  - question: "Do all important checks belong in the smoke suite?"
    answer: "I'd use a fast check before merge. I'd put a slower check we still need on a schedule that informs the release decision."
  - question: "Smoke tests pass, but the canary rollout stops completing orders. Would you expand it?"
    answer: "I'd keep the canary, a rollout to a small group, at its current size or roll it back under the release policy. I'd use completed orders to decide whether to expand. I'd look at staging checkout. Even if they passed, I'd check the same build's service contract and image scan results for clues about what changed."
sources:
  - label: GitHub Actions pull request and scheduled events
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows
  - label: GitHub Actions workflow jobs and schedule syntax
    url: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
  - label: GitHub Actions checkout
    url: https://github.com/actions/checkout/tree/v7
  - label: GitHub Actions Node setup
    url: https://github.com/actions/setup-node/tree/v7
  - label: npm clean install
    url: https://docs.npmjs.com/cli/v11/commands/npm-ci
  - label: npm test scripts
    url: https://docs.npmjs.com/cli/v11/commands/npm-run
examples:
  - title: Run fast cart checks before merge and broader cases nightly
    variants:
      - lang: yaml
        label: GitHub Actions (YAML)
        code: |
          name: Cart checks
          on:
            pull_request:
            schedule:
              - cron: '17 2 * * *'
          permissions:
            contents: read
          jobs:
            cart:
              runs-on: ubuntu-latest
              steps:
                - uses: actions/checkout@v7
                - uses: actions/setup-node@v7
                  with:
                    node-version: '24'
                - run: npm ci
                - if: github.event_name == 'pull_request'
                  run: npm run test:cart-smoke
                - if: github.event_name == 'schedule'
                  run: npm run test:cart-regression
---

I use smoke tests, quick tests of basic behavior, to see whether a build is usable enough to merge. I check important actions like signing in and completing an ordinary order. I'd run focused checks on a changed feature even when they aren't part of the usual smoke tests.

I'd use a full regression run to check more existing behavior. It can cover more browsers and existing account states than we have time for before merge. I pick the schedule based on how long a bug can go unnoticed. Each failure needs someone to review it and a rule for when it blocks release. If a nightly check keeps finding costly bugs, I'd look for a smaller version we could run before merge.

### Example

Suppose my cart project has both scripts and uses made-up data. On pull requests I test adding an item and checking out. At 02:17 UTC, I run more coupon and shipping combinations on the default branch. I'd rerun affected combinations against the version we plan to release.
