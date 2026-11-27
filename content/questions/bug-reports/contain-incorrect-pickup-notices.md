---
title: Customers get pickup notices for orders still being packed. What do you do?
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Stop further wrong notices with the incident team, then separate messages already sent from work still queued.
looksFor:
  - Escalates with a concrete customer impact while investigation continues.
  - Separates sent notices from queued notices using order and message records.
  - Considers what each mitigation can and cannot undo.
  - Defines recovery checks and leaves a timeline for review.
trap: Calling the incident resolved when the queue stops growing while customers still have bad notices.
followUps:
  - question: Support asks which customers to contact before the fix is ready. What can you give them?
    answer: I'd give the incident lead a deduplicated list of confirmed deliveries so support can reach affected customers through its approved workflow.
sources:
  - label: Google SRE, managing incidents
    url: https://sre.google/sre-book/managing-incidents/
  - label: Google SRE, postmortems and incident timelines
    url: https://sre.google/workbook/postmortem-culture/
---

I'd page the fulfillment on-call and tell support what customers are seeing. I'd ask the incident
lead to consider pausing pickup notices while keeping order processing available. Then I'd match
message receipts to order states at send time. That tells us who got a wrong message and which
queued jobs might still send one.

Before restarting, I'd ask what the queue will do with older work. A code rollback may stop the
bad rule from creating new notices while leaving bad work already in the queue. I'd give the
incident lead that evidence and, with approval, check recovery on a synthetic order. I'd record
the first affected send, containment, customer impact and recovery evidence for review.

### Example

Say North Street's orders are still packing but the mail provider has delivered 18 notices. I'd
check that any remaining bad work stays out of the resumed run and that a genuinely ready order
still gets one notice.
