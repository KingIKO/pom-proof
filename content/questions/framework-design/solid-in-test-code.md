---
title: A shared checkout base class keeps growing. How would you split it using SOLID?
topic: framework-design
roles: [sdet]
level: senior
type: concept
oneLine: Give test helpers one reason to change and introduce abstractions only when there is a real substitution or extension.
looksFor:
  - Separates page interactions, setup, and business assertions.
  - Extends behavior through composition instead of editing a shared base.
  - Explains substitutable clients and small fixture interfaces.
  - Gives a limit on abstraction before it harms readability.
trap: Adding an interface for every class before the suite has a second implementation.
followUps:
  - question: How would you know that two payment clients are substitutable?
    answer: I'd exercise the shared contract, including failures that callers rely on, with both versions.
sources:
  - label: Robert C. Martin on SOLID
    url: https://blog.cleancoder.com/uncle-bob/2020/10/18/Solid-Relevance.html
---

I'd apply single responsibility by splitting a page that drives payment fields from a helper that creates orders. To extend support for a new checkout flow, I'd compose those pieces rather than change a shared superclass and risk altering every caller.

Substitution means a fake payment client preserves the success and failure behavior that the calling test expects. Interface segregation means refund tests shouldn't have to depend on an interface with dozens of unrelated setup operations. Dependency inversion helps when the same test-facing service needs to accept a real client or a fake. For a helper with one caller and one implementation, a plain function can be enough.

### Example

I'd let subscription checkout introduce its own small payment form component and reuse the order builder. Tests that pay for a one-time order can keep their existing form.
