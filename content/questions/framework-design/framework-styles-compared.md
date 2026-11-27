---
title: A billing team repeats the same rate checks. Which test style would you choose?
topic: framework-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Pick the style that makes changes easiest for the people who write and review the tests.
looksFor:
  - Distinguishes linear scripts from reusable modules.
  - Explains how data rows differ from action keywords.
  - Names when behavior examples help shared discussion.
  - Picks a hybrid only where it fits the team.
trap: Picking labels for the framework without asking who will maintain the cases.
followUps:
  - question: Finance needs to change a full set of rate tiers without editing test code. What would you give them to review?
    answer: I'd move the rates to a validated data file so Finance can review the changed rows. The test can still own the quote request and compare the returned price with that table.
sources:
  - label: Cucumber introduction to behavior-driven development
    url: https://cucumber.io/docs/bdd/
---

A linear script reads in order and is quick to start. If each author copies the same steps, updates get expensive. A modular style extracts stable actions but can hide the case if the helpers are too broad. Data-driven tests let developers add a row for each rate and keep a single test body. An oversized table with unclear columns is hard to review.

Keyword-driven tests let people assemble named actions, but they have to learn the keyword vocabulary. Behavior-driven examples can help product and engineering agree on a rule together. Without that conversation the prose can turn into another layer to keep in sync.

### Example

I'd use data rows for rate tiers, a small helper for creating an account, and a behavior example for the disputed grace-period rule. That mix fits a billing team whose engineers already review code.
