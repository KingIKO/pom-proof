---
title: "Customers get pickup notices for orders still being packed. What do you do?"
topic: bug-reports
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: "I work with the incident team to stop more wrong notices. I separate notices already sent from those still waiting to go out."
looksFor:
  - "Tell the people handling the incident what customers are seeing while you investigate."
  - "Use order and message records to tell sent notices from notices still waiting."
  - "Explain what each proposed action can undo and what it leaves behind."
  - "Say how you'll check recovery and record when key events happened."
trap: "Calling the incident over because the queue stopped growing, even though customers still have wrong notices."
followUps:
  - question: "What can you give support if it needs to contact customers before the fix?"
    answer: "I'd give the incident lead a list of confirmed deliveries without duplicates. Support could use its approved process to contact the affected customers."
sources:
  - label: Google SRE, managing incidents
    url: https://sre.google/sre-book/managing-incidents/
  - label: Google SRE, postmortems and incident timelines
    url: https://sre.google/workbook/postmortem-culture/
---

I'd alert the person on call for order fulfillment and tell support what customers see. I'd ask the incident lead to consider pausing pickup notices without stopping order processing. I'd match delivery receipts to each order's status when the message went out. I'd use that to identify who got the wrong notice. I'd also check the queue, where jobs wait to run, for jobs that could still send one.

Before restarting, I'd ask what happens to older jobs in the queue. A rollback, or return to the previous code, may stop new bad notices without removing work already waiting. I'd share that evidence and get approval to check recovery with a made-up order. I'd record the first wrong send, what we did to stop it, who it affected, and how we checked recovery.

### Example

Suppose I see 18 delivered notices for North Street orders still being packed. I'd check that the resumed queue skips any remaining wrong notices. I'd check that an order that's truly ready still gets one notice.
