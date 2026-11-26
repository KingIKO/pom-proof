---
title: How do you report a defect when several services could be responsible?
topic: bug-reports
roles: [automation, sdet, senior]
level: mid
type: scenario
oneLine: File the broken user flow once, attach a timeline backed by evidence, and identify where the outcome first stops matching what you can verify.
looksFor:
  - Title the ticket around the user outcome and its expected timing.
  - Connect observations from the same run using timestamps and safe identifiers.
  - Separate verified events from gaps in visibility or guesses about ownership.
  - Give the issue one coordination owner and a clear end-to-end retest condition.
trap: Filing one ticket against each service or blaming the last component that showed a symptom.
followUps:
  - question: What would you do if you can't read one service's logs?
    answer: I'd note what I could see and give the service owner the test record ID and time window so they can check their side without sharing raw customer data.
---

I'd open one ticket for what the customer couldn't do. I'd build a timeline with the same test record ID throughout and include the expected delay if the work is asynchronous. If I can see one step succeed but can't see what happens next, I mark that as a gap. I'd ask triage to name someone to coordinate the investigation, even if more than one team has work to do.

### Example

A return shows as accepted in the warehouse app, but the item stays unavailable in inventory after the agreed five minutes. My ticket has the return ID, acceptance time, and inventory observations at five and fifteen minutes. I can see the warehouse record change; I don't yet know whether inventory received the update. I'd use the same return flow to verify the fix and check that available stock increases by one within the expected window.
