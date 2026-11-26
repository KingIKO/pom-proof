---
title: Report duplicate refund receipts
kind: bug-report
topic: defect-reporting
difficulty: easy
minutes: 6
roles: [manual-qa, automation]
items:
  - id: claims
    type: line-marking
    prompt: Mark the draft lines that claim more than the evidence supports.
    lines:
      - { id: line-1, text: 'Staging, Chrome 136, build 421, test order PP104.' }
      - { id: line-2, text: Two receipt emails arrived after two quick clicks. }
      - { id: line-3, text: The payment processor issued two refunds. }
      - { id: line-4, text: Every production customer is affected. }
  - id: attach
    type: multi-select
    prompt: Choose the artifacts that distinguish duplicate messages from duplicate ledger entries.
    choices:
      - { id: receipt-ids, text: The two test receipt message IDs and timestamps. }
      - { id: ledger, text: The staging ledger entry and its request correlation ID. }
      - { id: production, text: Screenshots of real customer payment details. }
      - { id: landing, text: An unrelated storefront screenshot. }
reference:
  claims: [line-3, line-4]
  attach: [receipt-ids, ledger]
decoy:
  claims: [line-2, line-4]
  attach: [receipt-ids]
---

On staging build 421, open settled test order `PP104` in Chrome 136. Double-click **Confirm refund** before the dialog closes. The test mailbox shows two receipt messages with different message IDs. The staging ledger shows one refund entry. Production was not checked.

The requirement is one customer receipt per recorded refund. Review the draft claims and pick evidence for the ticket.
