---
title: "How do you report a bug when several services could be responsible?"
topic: bug-reports
roles: [automation, sdet, senior]
level: mid
type: scenario
oneLine: "I file one ticket for what the user couldn't do. I use events I can prove to show where the result first went wrong."
looksFor:
  - "Name the outcome and how long the user should wait in the title."
  - "Use recorded times and safe IDs to connect events from the same run."
  - "Separate what you verified from what you can't see and any guesses about which team owns the problem."
  - "Name who will coordinate the work and what will prove the whole flow is fixed."
trap: "Filing a ticket for every service or blaming the last service where you saw a symptom."
followUps:
  - question: "What would you do if you can't read one service's logs?"
    answer: "I'd note what I could see. I'd send the service owner the test record ID and the time window so they can check without sharing raw customer data."
---

I'd open one ticket for what the customer couldn't do. I'd use the same test record ID to build a timeline. If the work is asynchronous, meaning updates finish later, I'd include how long it should take. If I see one step succeed but can't see the next one, I'd mark what I don't know.

I'd ask the team deciding what to do with the report to name someone to coordinate the investigation. I'd do that even if several teams need to help.

### Example

I see a return marked accepted in the warehouse app, but the item is still unavailable in inventory after the agreed five minutes. I include the return ID, the time the app accepted it, and what inventory showed at five and fifteen minutes. I can see that the warehouse record changed. I don't yet know if inventory got the update. I'd check the fix with the same return steps and expect available stock to rise by one within the agreed time.
