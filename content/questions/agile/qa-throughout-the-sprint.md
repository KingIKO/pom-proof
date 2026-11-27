---
title: How do you contribute to quality throughout a sprint?
topic: agile
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: I raise risks before coding starts and prepare checks during development. I share what the team has verified.
looksFor:
  - Before development starts, ask for an example of an unclear rule.
  - Plan the test data and accounts while a developer builds the feature.
  - Test the first usable version with a developer.
  - Tell the team what passed and which checks are still blocked.
trap: Waiting until the feature is finished and leaving quality to the tester alone.
followUps:
  - question: What can you do if there is no build yet?
    answer: I'd set up the accounts and files I need. I'd agree with a developer on what should happen in the highest-risk case.
sources:
  - label: Scrum Guide on Scrum Team responsibilities
    url: https://scrumguides.org/scrum-guide.html#scrum-team
  - label: Scrum Guide on sprint events
    url: https://scrumguides.org/scrum-guide.html#scrum-events
  - label: Scrum Guide on Product Backlog refinement
    url: https://scrumguides.org/scrum-guide.html#product-backlog
---

I start by asking what the user should be able to do and what could go wrong. An acceptance criterion says what the feature must do. If it says an upload should show an error, I ask what happens to the file the user already saved. I can prepare the test account and files while a developer builds the change.

When a version is ready to test, I check it with a developer. I share what we found while the team still has time to act. I tell the team what I could check and what is still blocked. In Scrum, checking the work belongs to the team. I bring testing skills and other team members can test too.

I usually prevent the most rework during backlog refinement, when the team clarifies upcoming work. In planning, I say what testing depends on and estimate the effort. At the daily stand-up, I say what is blocking the work. At the review, I share what we saw in the working increment, the part of the product we built. At the retrospective, I propose one change based on what slowed feedback.

### Example

For profile photos, we agreed that if an upload fails, the current photo should stay. I prepared a valid image and one that was too large. The first build removed the photo when it rejected the upload. We fixed it and checked that the old image still appeared after a reload.
