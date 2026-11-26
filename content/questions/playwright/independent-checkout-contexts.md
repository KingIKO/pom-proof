---
title: When should a Playwright test use two browser contexts?
topic: playwright
modelAnswer: Use separate contexts when the test needs independent sessions, such as two customers competing for the same inventory. Contexts isolate cookies and browser storage. Pages in one context can share that state.
looksFor:
  - Explain what a context isolates.
  - Separate browser session state from shared backend state.
mistakes:
  - Treating a second tab as a second customer session.
  - Assuming browser context isolation creates separate database records automatically.
followUps:
  - How would both customers compete for the same last pickup slot?
  - Which assertions prove only one reservation was created?
---

A test opens the checkout page twice. Both pages unexpectedly show the same cart. Explain where the sharing comes from and how to test two independent customers who compete for shared inventory.
