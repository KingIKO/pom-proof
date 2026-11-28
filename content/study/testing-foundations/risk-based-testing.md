---
title: Risk-based testing
module: testing-foundations
order: 4
level: core
summary: Give more test time to failures that are likely or would cause serious harm. Explain what remains uncertain when you make a release recommendation.
minutes: 2
prerequisites: [testing-foundations/why-we-test]
outcomes:
  - Tell a product risk from a project risk.
  - Use likelihood and impact to decide which tests to run first.
  - Explain which unchecked risks matter to a release decision.
useWhen:
  - You have a deadline and need to decide which checks get the most attention.
avoidWhen:
  - You would call an area low risk only because nobody has assessed it.
practiceTopics: [release-risk]
questionTopics: [fundamentals, test-design]
sources:
  - { label: "ISTQB: Foundation Level syllabus, sections 5.1.5 and 5.2", url: "https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf", type: primary }
  - { label: "Software Engineering at Google: The Beyoncé rule", url: "https://abseil.io/resources/swe-book/html/ch11.html", type: practitioner }
---
## What it is

Risk-based testing uses risks, events that could cause harm, to decide what to check, how deeply to check it and what to run first. Likelihood is the chance that the event will happen. Impact is the harm it would cause. A product risk concerns the software, such as charging a customer twice. A project risk concerns the work, such as not getting a test environment before release.

## How it works

Start with what changed. Ask the team how it could fail and who would be affected. Estimate each risk using what you know, such as past incidents and how often users take that path. Simple ratings can be enough if you write down the reasons.

Combine the ratings in a matrix, a grid with likelihood on one side and impact on the other. The cell where the ratings meet gives the risk level. Run checks for the highest risks first.

For example, suppose a checkout release changes how it handles a slow payment response. If retries are plausible, send the same payment request twice and check that the customer is charged just once. Run that before checking a minor receipt layout change. For a behaviour that must keep working, add an automated check. Google calls this testing habit the Beyoncé rule.

## Why it helps

Testing the highest risks first gives the team useful evidence even if time runs out. Other ways to order tests include coverage-based prioritisation, which starts with tests that exercise more code or other targets. Requirements-based prioritisation starts with the requirements stakeholders rank highest.

## When not to use it

An area you haven't assessed has unknown risk. Keep it visible and revise the plan when you learn more. If a payment test needs a provider account, make that setup available first. If it's unavailable, tell the release owner what you couldn't check. A rating alone can't tell them whether to release.
