---
title: "How do you use defect clustering without ignoring other areas?"
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "Give recurring problem areas more attention and reserve coverage for high-risk areas with little testing history."
looksFor:
  - "Names a way to group defect evidence."
  - "Accounts for traffic and differences in test effort."
  - "Uses finding clusters to target more than retests."
  - "Keeps baseline coverage for other critical paths."
trap: "Allocating coverage from raw ticket counts alone or quoting a fixed split as a rule."
followUps:
  - question: "What would make you stop weighting a hotspot so heavily?"
    answer: "Evidence that the common cause was removed, its related paths were exercised, and recent releases have stopped producing that failure."
sources:
  - label: "ISTQB CTFL v4.0.1, section 1.3"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

I group recent defects by where they started, rather than which screen reported them. If several failures come from the same state change or service, I spend extra time on the paths that share it. I compare the cluster against where we test most often. An area with no reported defects could be healthy or barely exercised, and those call for different decisions.

### Example

When returns, refunds, and order history all had issues after partial cancellations, I'd group those under the order state change. I'd follow it through all affected features and keep checkout smoke coverage. I'd also give the newly added pickup path a focused pass because it has no meaningful defect history yet.
