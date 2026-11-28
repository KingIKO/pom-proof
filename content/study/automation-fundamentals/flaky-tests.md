---
title: Flaky tests
module: automation-fundamentals
order: 7
level: core
summary: A flaky test sometimes passes and sometimes fails on unchanged code. The first failure can help you find what changed between runs.
minutes: 2
prerequisites: [automation-fundamentals/test-independence, automation-fundamentals/waiting-and-synchronisation]
outcomes:
  - Use first-attempt evidence to investigate an intermittent failure.
  - Explain what a pass after a rerun tells you and what it leaves open.
useWhen:
  - The same version produces both a failure and a pass.
avoidWhen:
  - Your team would discard the first failure and count only the final result.
  - No one will take responsibility for fixing a test removed from the main run.
practiceTopics: [test-isolation]
questionTopics: [flaky-tests]
sources:
  - { label: "pytest: Flaky tests", url: "https://docs.pytest.org/en/stable/explanation/flaky.html", type: primary }
  - { label: "Playwright: Retries", url: "https://playwright.dev/docs/test-retries", type: primary }
  - { label: "Playwright: Clock", url: "https://playwright.dev/docs/clock", type: primary }
  - { label: "Martin Fowler: Non-deterministic tests", url: "https://martinfowler.com/articles/nonDeterminism.html", type: practitioner }
expertsDisagree:
  - question: Should you retry or quarantine a flaky test?
    note: Retries can help detect flakiness if the first failure stays visible. Quarantine gives the team time to fix it.
    positions:
      - view: Playwright Test has built-in retries. When a failed test passes on a retry, the runner labels it flaky.
        holdsWhen: You retain both outcomes and investigate the difference between attempts.
        source: https://playwright.dev/docs/test-retries
      - view: pytest lists rerun plugins as a way to reduce disruption. Its docs call a lasting non-strict `xfail` mark, a kind of manual quarantine, "rather dangerous".
        holdsWhen: A team marks a failing test as expected to fail and never removes the mark, so its failures stop counting.
        source: https://docs.pytest.org/en/stable/explanation/flaky.html
      - view: Fowler recommends a limit on quarantine. He gives two examples, a cap of eight tests or a week at most for each test.
        holdsWhen: The team needs to keep flaky tests out of the required checks and has time set aside to fix them.
        source: https://martinfowler.com/articles/nonDeterminism.html
---
## What it is

A flaky test passes in some runs and fails in others without a code change. Its result can depend on something the test does not control. The bug can be in the test, the app or the environment.

## How it works

Save the first failure's output and compare it with a passing run. If two tests write to the same account, run them on separate accounts and compare. If the test checks a status before the app updates it, wait for the status you expect. Compare runs before and after changing one cause.

Other causes include an unreliable remote service and resources left open between tests. A clock can cause trouble too. For example, a test near midnight may read a different date on its next run. Set the time the app reads if the case needs a known date. Playwright's `page.clock.setFixedTime` method gives browser date reads a fixed value.

## Why it helps

When failures often vanish on a rerun, people learn to ignore them. They can miss a real problem with the next code change. Keeping the first failure gives you something to investigate even when the next attempt passes.

## When not to use it

If you need to keep unreliable results out of required checks, quarantine the test. This means running it separately while someone fixes it. Name an owner and agree when to put it back. Leaving the test there indefinitely removes protection from the main run. A rerun can expose the problem, but it cannot repair it.
