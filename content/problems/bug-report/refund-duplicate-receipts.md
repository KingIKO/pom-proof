---
title: Report two receipts for one refund
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 6
roles: [manual-qa, automation]
items:
  - id: claims
    type: line-marking
    language: text
    prompt: Which lines in the draft claim something the evidence does not show?
    lines:
      - { id: line-1, text: 'Staging, Chrome 136, build 421, test order PP104.' }
      - { id: line-2, text: Two receipt emails arrived after two quick clicks. }
      - { id: line-3, text: The payment processor issued two refunds. }
      - { id: line-4, text: Every production customer is affected. }
  - id: attach
    type: multi-select
    prompt: Which records would tell you whether there are extra receipts or extra refunds?
    choices:
      - { id: receipt-ids, text: The message ID and time for each test receipt. }
      - { id: ledger, text: The test ledger entry and ID linking it to the request. }
      - { id: production, text: Screenshots showing real customers' payment information. }
      - { id: landing, text: A storefront screenshot that does not show the order. }
reference:
  claims: [line-3, line-4]
  attach: [receipt-ids, ledger]
decoy:
  claims: [line-2, line-4]
  attach: [receipt-ids]
---

In Chrome 136, open test order `PP104` on staging build 421. Staging is a separate test environment. The order's payment has settled, which means the payment went through. Double-click **Confirm refund** before the dialog closes.

The test mailbox shows two receipt messages. Each has a different message ID. The staging ledger, or record of payments and refunds, shows one refund entry. No one checked production, the live system.

The system must send one customer receipt per recorded refund. Check what the draft claims. Then choose evidence for the bug report.
