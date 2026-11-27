---
title: "A shared checkout base class keeps growing. How would you use SOLID to split it?"
topic: framework-design
roles: [sdet]
level: senior
type: concept
oneLine: "I give each helper one reason to change. I add another layer only when I have real pieces to combine or swap."
looksFor:
  - "Separate screen actions, setup, and checks for business behavior."
  - "Put small helpers together for new behavior instead of editing a shared base class."
  - "Explain how clients can replace each other and why tests need only a few setup methods."
  - "Explain when extra layers would make the tests harder to read."
trap: "Adding an interface to every class before the tests need a second version."
followUps:
  - question: "How would you check that two payment clients can stand in for each other?"
    answer: "I'd run both against the same rules for requests and results. I'd include failures the calling code depends on."
sources:
  - label: Robert C. Martin on SOLID
    url: https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html
---

SOLID is a set of design principles for code. For single responsibility, I'd separate the helper that fills payment fields from the helper that creates orders. That's one main job for each. For a new checkout flow, I'd use composition, putting small helpers together. Editing the class that all flows inherit from could change their behavior too.

Substitution means my fake payment client works like the real one for successes and failures the test expects. For interface segregation, I'd let refund tests depend on only the setup actions they need. They can skip a long list of unrelated operations. Dependency inversion lets the same test-facing service use a real client or a fake through the same set of methods. If a helper has only one caller and one version, a plain function can be enough.

### Example

I'd give subscription checkout its own small payment form helper and reuse the order builder. I'd leave one-time order tests on their existing form.
