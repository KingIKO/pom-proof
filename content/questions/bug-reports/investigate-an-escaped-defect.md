---
title: "A bug reached customers. How do you find out why and prevent it from coming back?"
topic: bug-reports
roles: [sdet, senior]
level: senior
type: scenario
oneLine: "I help limit the harm to customers. I find what caused the failure and why our release checks missed it."
looksFor:
  - "Find out who was affected and agree on what to do to limit the immediate harm."
  - "Repeat the failure with safe data and test the suspected cause."
  - "Explain why the existing checks passed even with the bug."
  - "Assign someone to prevent a repeat and show the new check catches the old bug."
trap: "Ending the review at “QA missed it” or adding a test without proving it catches the failure."
followUps:
  - question: "What if you can't reproduce the bug in staging, the environment you use before release?"
    answer: "I'd compare the inputs and settings in the live and test environments with the team. I'd keep the evidence and leave the cause open. I'd still work to limit the harm if the evidence calls for it."
  - question: "Where would you put a regression test, a test that catches the bug if it returns?"
    answer: "I'd put the main test where it can reliably repeat the failure. I'd only add a test across components if the link between them can fail in a way the main test can't see."
---

I'd find out who the bug affects and what we can do to limit more harm. I'd work with engineering to repeat the failure with safe data. I'd use evidence to answer two questions. What caused the bad result? Why did the release checks pass?

I'd make sure someone owns each action we take to prevent a repeat. I'd agree on how to show each action works.

### Example

Suppose I find monthly usage reports leave out some of the last day's usage for customers west of UTC. UTC is the reference time used across time zones. I'd ask the release owner to pause the remaining sends while we find which reports need replacing. I'd replay the failure under known conditions. Suppose the query, the request for data, uses a UTC cutoff instead of the customer's local cutoff.

I'd check our fixtures, the data we set up for tests. They use only UTC accounts, where both cutoffs match. I'd add a New York account with records on either side of local midnight at the end of the month. I'd show that the same report check fails before the fix and passes afterward.
