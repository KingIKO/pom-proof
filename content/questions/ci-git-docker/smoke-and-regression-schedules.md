---
title: What runs in pull request smoke tests versus a full regression schedule?
topic: ci-git-docker
roles: [manual-qa, automation, sdet, senior]
level: mid
type: scenario
oneLine: Check the fastest critical journeys before merge and run wider combinations on a schedule with a response owner.
looksFor:
  - A plausible pull request time budget
  - Coverage chosen for the cost of finding a failure late
  - An owner for nightly or release-candidate failures
  - A plan when a scheduled check catches something
trap: Scheduling expensive checks overnight without agreeing who reads the results or what they can block.
followUps:
  - question: Do all important checks belong in the smoke suite?
    answer: I'd look for a fast signal before merge and keep an expensive, necessary check on a schedule tied to the release decision.
  - question: The cart smoke suite is green but the canary stops completing orders. Should you widen the rollout?
    answer: I'd keep the cart canary at its current scope or roll it back under the release policy. The completed-order check decides whether to widen it. I'd look at the staging checkout result and use the same build's contract and image scan results to narrow what changed, even if those earlier promotion checks passed.
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

I use smoke tests to prove the build is usable enough to merge. I want fast feedback on things like signing in or completing a normal order. I'd run focused checks for the changed feature too, even if those checks aren't in the default smoke list.

Full regression can cover combinations that don't fit that feedback window, like a wider browser matrix and existing-account states. I choose the schedule based on how long a bad result can sit unnoticed. Each scheduled failure needs someone to triage it and a rule for when it blocks the next release. If a nightly check keeps finding expensive defects, I'd ask whether a smaller version belongs before merge.

### Example

Assume the cart repo defines the two scripts and runs against synthetic data. The pull request checks adding an item and completing checkout. The scheduled run uses the default branch and is set for 02:17 UTC to cover more coupon and shipping combinations. I'd rerun affected combinations on the release candidate.
