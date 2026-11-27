---
title: What would you verify live after shipping a new appointment search?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: Add narrowly scoped live checks after pre-release testing, and stop expanding the rollout if customer outcomes degrade.
looksFor:
  - Describes what production can reveal after pre-release checks pass.
  - Uses tagged synthetic probes and data that cannot affect real appointments.
  - Compares live outcomes by version or cohort during gradual rollout.
  - Defines who can disable the flag and what triggers recovery.
trap: Using a customer's account to see whether a live booking can be made and then cleaned up.
followUps:
  - question: What if the live probe cannot safely complete a real booking?
    answer: I'd keep the production probe read-only and test the booking in staging. For real bookings in production I'd watch aggregate success and latency.
sources:
  - label: Azure Well-Architected Framework on progressive exposure and recovery
    url: https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments
  - label: Amazon CloudWatch synthetic monitoring
    url: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html
---

I'd finish the functional and integration tests before release. Production lets me check things
that staging may not match, such as live routing and the mix of real searches. I'd schedule a
tagged probe using an approved test account and synthetic records, with no access to customer
data and no way to reserve capacity or send notifications.

I'd use a feature flag to expose the search gradually and compare results by cohort. Before
release I'd agree on what stops the rollout, who owns recovery, and how to tell when the old
search is serving again. I'd exercise the automatic stop rule in staging.

### Example

A probe looks up a synthetic clinic and checks that its published slot appears without booking
it. If the flagged cohort's search-error rate exceeds the agreed limit over the observation
window, the rollout stops and the team disables the flag, then checks recovery.
