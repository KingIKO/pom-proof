---
title: "How would you test PUT and PATCH on the same record?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "I usually use PUT to send the replacement record. I use PATCH to apply changes, and what those changes do depends on the patch format."
looksFor:
  - "Tell replacing the record apart from applying selected changes."
  - "Test leaving a field out separately from setting it to null."
  - "Read the record and check the fields that should change or stay the same."
  - "Explain why PATCH isn't always idempotent, meaning a repeat can have an extra effect."
trap: "Sending only the changed field with PUT and assuming the missing fields stay as they were."
followUps:
  - question: "Can you always retry an identical PATCH safely?"
    answer: "I'd check the operation first. Setting an email preference can have the same effect if repeated. A patch that appends an item may add another one on each run."
sources:
  - label: "MDN, PATCH request method"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH
---

I'd start a PUT test with the full replacement the API documents. I'd check the result of sending the full request. In another case, I'd leave out a field and check what the API promises to do with it.

For PATCH, I'd check the rules of the patch format, the way the API describes changes. I'd find out whether an explicit null clears a field. After either request, I'd read the record back. I'd check both the fields that should change and the ones that should stay the same.

### Example

I'd use customer settings with a time zone and an optional display name. If a partial update promises to leave missing fields alone, I'd change the name and expect the same time zone. To clear the name, I'd use the documented operation and check a fresh read.
