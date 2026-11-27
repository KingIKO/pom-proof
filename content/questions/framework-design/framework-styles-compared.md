---
title: "A billing team repeats the same rate checks. Which test style would you choose?"
topic: framework-design
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I choose the style that helps the people writing and reviewing the tests make changes."
looksFor:
  - "Explain how a sequence of steps differs from reusable pieces of code."
  - "Explain when you supply data rows and when you choose named actions."
  - "Describe when examples help people agree on expected behavior."
  - "Mix styles only if that helps the team maintain the tests."
trap: "Choosing a framework style without asking who will maintain the cases."
followUps:
  - question: "If Finance needs to change a full set of rate tiers without editing code, what would you give them to review?"
    answer: "I'd move the rates into a data file and check its format. Finance could review the changed rows. I'd keep the request for a quote in the test and compare the price it gets with the table."
sources:
  - label: Cucumber introduction to behavior-driven development
    url: https://cucumber.io/docs/bdd/
---

I'd start with a linear script if I want a quick sequence of steps I can read in order. If people copy those steps, changing them gets expensive. In a modular style, I put stable actions in helpers I can reuse. If a helper does too much, it hides what the test checks.

With data-driven tests, I'd add one row per rate and keep the same test code. If the table gets large or its columns are unclear, it's hard to review. With keyword-driven tests, I'd put named actions together, but I'd need to learn those names. I'd use behavior-driven examples to help product and engineering agree on a rule. If they don't have that discussion, the examples can become extra text people have to update.

### Example

For a billing team whose engineers already review code, I'd use data rows for rate tiers and a small helper to create accounts. I'd use a behavior example to settle the disputed grace-period rule.
