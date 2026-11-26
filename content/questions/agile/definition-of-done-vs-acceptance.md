---
title: How is the Definition of Done different from acceptance criteria?
topic: agile
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: Acceptance criteria describe a specific change, while the Definition of Done sets the quality bar for the Increment.
looksFor:
  - Give an acceptance criterion specific to one backlog item.
  - Give a measurable quality requirement that applies across changes.
  - Explain that checking off the acceptance criteria alone does not make work Done.
  - Keep unfinished work out of the Increment and release.
trap: Marking an item Done as soon as its feature checks pass, even with a known failure against the Definition of Done.
followUps:
  - question: Can the Product Owner waive a missing Done check to make the Sprint Review?
    answer: Product acceptance does not make the item meet the Definition of Done. The unfinished item returns to the Product Backlog for future consideration.
sources:
  - label: Scrum Guide on the Definition of Done
    url: https://scrumguides.org/scrum-guide.html#commitment-definition-of-done
---

I use acceptance criteria to check what is different about this piece of work. For a report filter, that might mean that selecting April shows only April invoices. The Definition of Done applies to the Increment and describes the quality it has to meet. Our team might require that changed controls work from the keyboard, for example.

I'd check both before calling the work Done. In Scrum, work that misses the Definition of Done stays out of the Increment. If it is still unfinished at the end of the sprint, the item goes back to the Product Backlog for future consideration. We can't release the unfinished item or present it at the Sprint Review.

### Example

An invoice filter returned the right rows, but I couldn't move focus out of its date picker with the keyboard. We kept the item open, fixed the focus behavior, and reran the keyboard check alongside the April filter check before marking it Done.
