---
title: "How would you run a useful exploratory testing session?"
topic: fundamentals
roles: [manual-qa, automation, senior]
level: mid
type: scenario
oneLine: "I start with a charter, a short plan for the risk I want to explore. I adapt my tests and leave notes others can use."
looksFor:
  - "Name what you'll test and what question you want to answer."
  - "Use what you see to choose the next test."
  - "Write down what data you used, what you saw, and what you still need to find out."
  - "Follow up on findings you can repeat or that could cause serious harm."
trap: "Trying things in the app without writing down what you tried."
followUps:
  - question: "What would you share in the debrief, the discussion after the session?"
    answer: "I'd share the charter, what I tested, and what I learned. I'd help decide which problems or gaps need more testing."
  - question: "What would you leave for the tester who runs the next session?"
    answer: >-
      I'd use session-based test management, which organizes work into sessions with a set length.
      I'd link the charter and the time limit to my report. I'd record my data, what I tried, and what I still need to test.
      In the debrief, I'd help pick the next risk to check.
  - question: If the reopened draft has the right text but the first tab still says "Saving," what would you do next?
    answer: >-
      After reconnecting, I'd add a sentence I can recognize in the first tab. Then I'd open a fresh copy of the draft.
      If the sentence shows up, I'd find out why the status didn't update.
      If it doesn't, I'd record both edits and note which one the service kept.
sources:
  - label: "ISTQB CTFL v4.0.1, section 4.4.2"
    url: https://www.istqb.org/certifications/certified-tester-foundation-level
---

In exploratory testing, I choose what to try next based on what I see. I write a charter, a short plan that names the risk and the part of the product I want to learn about. I set aside enough time to follow up on what I find.

During the session, I note my starting data and what happened. I pay particular attention to anything that changes what I try next. After the session, I separate bugs I can repeat from open questions. I also write down what I didn't get to.

### Example

For a draft editor, I'd check whether edits survive a brief disconnect. If the text comes back but the tab still says "Saving," I'd reload the page. Then I'd open the draft in a second tab to check which version the service kept. I'd use that result to report a display problem or lost data.
