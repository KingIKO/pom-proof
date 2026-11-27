---
title: "What belongs in a test strategy, and what belongs in a test plan?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: junior
type: concept
oneLine: "In a strategy, I say how I test and why. In a plan for specific work, I name who runs the tests, when, and what evidence we need."
looksFor:
  - "Describe decisions the team can reuse for other work."
  - "Name what changes for each release or project."
  - "Use one feature to show how the strategy informs the plan."
  - "Explain that the team can keep both in one document."
trap: "Treating a list of tests as a complete plan without saying where to run them, who runs them, or when the run is done."
followUps:
  - question: "If the release date moves earlier, what would you change first?"
    answer: "I'd update the plan to say when and what we can test. I'd also flag any risks we can no longer cover with our current approach."
  - question: "What would you check in the plan before handing it to someone on release day?"
    answer: >-
      I'd check that it says what we'll test, what we want to learn, and what we assume.
      I'd look for who does the work, when they do it, where tests run, and what data to use.
      I'd check when we can start or stop testing and where to report results.
      If the plan leaves a case out, I'd look for what might fail and who is willing to accept that risk.
sources:
  - label: "ISTQB CTFL v4.0.1, section 5.1.1"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I use a test strategy to say how we'll test and why. It can say which checks I run against one service on its own. It can also say when I need the real service that a feature depends on.

I use a test plan to apply that approach to this release or project. I name the risks we'll test and who will prepare the data. I write down when we can run the tests and how we'll decide whether we've tested enough. On a small team, I'd be happy to write both in one place.

### Example

If the payment provider changes how its service works with ours, I might require one check in its sandbox, a real test environment. For this week's refund release, I'd name the environment and the person who will run the check. I'd list the amounts and currencies to test. I'd say when a failed reconciliation, or check that the payment records match, would block the release.
