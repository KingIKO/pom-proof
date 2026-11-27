---
title: What would you check in production after releasing a new appointment search?
topic: system-design
roles: [sdet, senior]
level: senior
type: concept
oneLine: After testing before release, I'd run a few focused live checks. If search gets worse for customers, I'd stop giving more people the new version.
looksFor:
  - Say what the live system can show even after the earlier checks pass.
  - Label automated test requests and use test data that can't affect real appointments.
  - Compare live results by version or group as more people get the new search.
  - Agree on who can turn off the new search and what should make them do it.
trap: Using a customer's account to make a live booking and planning to remove it later.
followUps:
  - question: What would you do if a live check can't safely book an appointment?
    answer: I'd keep the live check read-only and test booking in staging. In production, I'd watch overall success rates and response times for real bookings.
sources:
  - label: Azure Well-Architected Framework on progressive exposure and recovery
    url: https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/safe-deployments
  - label: Amazon CloudWatch synthetic monitoring
    url: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html
---

Before release, I'd finish tests of what the feature does and how its parts work together. Staging, the test environment, might not match how production routes requests or the mix of searches real users send. I'd schedule a tagged probe, an automated check with a label that identifies its traffic. I'd use an approved test account and made-up records. The probe must not read customer data, reserve appointments, or send notifications.

I'd use a feature flag, a switch that controls who gets the new search. I'd turn it on gradually and compare results for each cohort, or group of users. Before release, I'd agree on what stops the rollout and who handles recovery. I'd agree on how to tell when the old search is receiving requests again. I'd test the automatic stop rule in staging.

### Example

I'd look up a made-up clinic and check that its published slot appears without booking it. If the search error rate for the flagged group exceeds the agreed limit during the measurement period, I'd stop the rollout. I'd have the team turn off the flag and check that search recovers.
