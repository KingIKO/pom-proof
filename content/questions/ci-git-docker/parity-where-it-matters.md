---
title: "What is test environment parity? Where does it matter most?"
topic: ci-git-docker
roles: [automation, sdet, senior]
level: senior
type: scenario
oneLine: "I match the settings the behavior depends on. I plan separate checks for differences that could make my results misleading."
looksFor:
  - "Name a behavior that depends on a particular live setting."
  - "List the differences that could change what the test proves."
  - "Use the same build and representative settings for the software it depends on."
  - "Give an example using made-up data and a separate check for a remaining risk."
trap: "Assuming a shared Docker image means feature switches, scheduled jobs, and other companies' services also match."
followUps:
  - question: "Do you need real customer data for test environment parity?"
    answer: "I'd use synthetic records, meaning made-up data that matches the formats and limits that matter. I don't need sensitive customer data to match those conditions."
---

I start with the behavior I need to test. Environment parity means matching the parts of the setup the behavior depends on. A scheduled billing job depends on the time zone and the tool that starts it. Search may depend on the version and settings of the tool that builds the search index.

I'd deploy the same application build and list meaningful differences before release. I'd compare feature flags, the switches that turn features on and off, as well as software versions and settings. I'd make up data with representative formats and amounts.

I wouldn't assume a payment sandbox or a small test setup behaves exactly like production. A sandbox is a test payment service that doesn't make real charges. I'd check remaining risks separately before release or watch them during rollout with a named owner.

### Example

I see a report pass locally with a dozen rows but time out on accounts the size customers use. I'd make up a dataset of similar size, compare database settings, and rerun the report with a similar request deadline.
