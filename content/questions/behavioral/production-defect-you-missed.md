---
title: "Tell me about a bug you missed before it reached customers. What did you change afterward?"
topic: behavioral
roles: [manual-qa, automation, sdet, senior]
level: mid
type: behavioral
oneLine: "I explain what I missed and how I helped limit the damage. I show that the new check would have caught it."
looksFor:
  - "Name the specific case you missed."
  - "Explain what you did to limit the immediate impact or find the cause."
  - "Report the impact and show that the new check catches the old bug."
  - "Share a lesson you use when designing tests now."
trap: "Blaming the developer or adding a test without showing it would have caught the bug."
followUps:
  - question: "How did you decide that the new check was worth keeping?"
    answer: "I ran it on the old and fixed builds. I saw it fail before the fix and pass afterward."
---

I approved account notifications after testing new accounts. I missed older accounts where the saved preference was blank. After launch, support found 18 customers hadn't received their renewal reminder. I reproduced the problem with a made-up account that used the old data format. I gave the person handling the incident a way to find other affected accounts.

I added a regression check, a test that catches the bug if it returns, for blank preferences. I ran it on the old and fixed builds. I added a question to release review about existing data whenever a default changes. I learned to ask what data is already saved before I build tests around a new default.

### Example

I used a blank preference and expected one scheduled reminder. I saw zero on the old build, so the check failed. I saw the expected reminder on the fixed build, so it passed.
