---
problem: test-design/delivery-fee-mutants
---

Use three inputs to isolate the competing rules:

| Subtotal (cents) | Zone | Expected fee (cents) | Defect exposed |
| --- | --- | --- | --- |
| 4,999 | local | 450 | Waives the fee one cent early |
| 5,000 | local | 0 | Requires a subtotal above 5,000 |
| 5,000 | remote | 900 | Applies the local waiver to a remote order |

Middle-of-range prices pass on all three faulty versions. Keep the quote matrix close to the pricing function, then use a focused Playwright test to check that the fee displayed in checkout reaches the order total.
