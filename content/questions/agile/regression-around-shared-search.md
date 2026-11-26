---
title: A small search change touches a shared query. How do you choose sprint regression checks?
topic: agile
roles: [manual-qa, automation, sdet]
level: mid
type: scenario
oneLine: Find the other features that use the changed query and test the ones where a wrong result would matter most.
looksFor:
  - Ask which screens and jobs use the changed query.
  - Pick a fixture that distinguishes the new rule from the existing rule.
  - Check a caller that should change and a caller that should stay the same.
  - Explain what can be left to existing coverage or a later check.
trap: Running every search test while missing a report that uses the same query.
followUps:
  - question: What if you cannot tell which features share the query?
    answer: I'd ask the developer to trace the call sites with me. Until then I'd name the callers I've checked and leave the rest unverified in my test notes.
---

I'd ask the developer to show me what else calls the query. A small change can affect pages the ticket never mentions. Then I'd pick inputs that make the expected difference easy to see. I want to check the new behavior and keep at least one check for a caller that should behave as before.

I'd spend time on callers that can affect a customer or a business decision. For a screen that only displays the same results in another layout, I'd use the existing coverage unless the layout changed too.

### Example

Support asked for order search to include archived orders. The same query fed a report for the warehouse team, where archived orders still had to stay out. I made one active order and one archived order for the same buyer. The search was right, but the report included both. The developer made archive inclusion explicit for each caller, and I reran both checks with the same fixture.
