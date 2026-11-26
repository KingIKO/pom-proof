---
title: How do you contribute to quality throughout a sprint?
topic: agile
roles: [manual-qa, automation]
level: junior
type: concept
oneLine: Raise risks before coding starts, prepare checks during development, and share what the team has verified.
looksFor:
  - Ask for a concrete example of an unclear rule before development.
  - Plan test data and accounts while the feature is being built.
  - Pair with a developer on the first version that can be tested.
  - Tell the team what passed and what is still blocked.
trap: Waiting for a finished feature and treating quality as the tester's responsibility.
followUps:
  - question: What can you do if there is no build yet?
    answer: Set up the accounts and files you'll need, then agree with a developer on the expected result for the highest-risk case.
sources:
  - label: Scrum Guide on Scrum Team responsibilities
    url: https://scrumguides.org/scrum-guide.html#scrum-team
---

I start by asking what the user should be able to do and what could go wrong. If an acceptance criterion says an upload should show an error, I ask what happens to the file the user already saved. I can get the test account and files ready while someone builds the change.

Once there is something to test, I pair with a developer on the first pass and share findings while there is time to act on them. I tell the team which behavior I could verify and what is still blocked. Scrum puts verification within the team's work, so I can bring testing skills without being the only person who tests.

### Example

For profile photos, we agreed that a rejected upload should keep the current photo. I prepared a valid image and one over the allowed size. The first build removed the photo on rejection, so we fixed it and checked that the old image still appeared after reloading.
