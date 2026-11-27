---
title: "What do acceptance criteria check, and what does the Definition of Done check?"
topic: agile
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I use acceptance criteria to check what one change must do. I use the Definition of Done to check the quality of the finished work."
looksFor:
  - "Give a requirement that applies to one item on the team's work list."
  - "Name a quality check that applies across changes and has a clear result."
  - "Explain why passing a feature's checks alone doesn't make it Done."
  - "Keep unfinished work out of the finished product and the release."
trap: "Calling a change Done after its feature checks pass, even though it misses a required quality check."
followUps:
  - question: "Can the Product Owner waive a Definition of Done check so an item makes the Sprint Review?"
    answer: "I'd keep the item out if it misses the Definition of Done, even if the Product Owner accepts it. I'd return it to the Product Backlog for the team to consider later."
sources:
  - label: Scrum Guide on the Definition of Done
    url: https://scrumguides.org/scrum-guide.html#commitment-definition-of-done
---

I use acceptance criteria to check what a particular change must do. For example, when I select April in a report filter, I should see only April invoices. The Definition of Done sets the quality requirements for the Increment, the usable product work the team has completed. My team might require all changed controls to work from the keyboard.

I check both before calling work Done. In Scrum, if work misses the Definition of Done, I leave it out of the Increment. If it's still unfinished at the end of the sprint, it goes back to the Product Backlog, the list of work to consider. I can't release it or show it at the Sprint Review.

### Example

I saw the right invoices after filtering, but I couldn't move keyboard focus out of the date picker. We kept the item open and fixed the problem. I checked the keyboard behavior and the April filter again before we marked the item Done.
