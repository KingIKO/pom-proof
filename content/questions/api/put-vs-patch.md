---
title: "How would you test PUT versus PATCH on the same resource?"
topic: api
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: "PUT generally supplies a replacement representation; PATCH applies a set of changes whose exact behavior depends on the patch format."
looksFor:
  - "Knows the replacement versus change distinction."
  - "Checks omission separately from explicit null."
  - "Reads back saved state and unaffected fields."
  - "Does not assume every PATCH is idempotent."
trap: "Sending only the changed field with PUT and assuming every omitted field will be preserved."
followUps:
  - question: "Is PATCH safe to retry by definition?"
    answer: "No. Setting an email preference can be repeatable, while a patch that appends an item can change the resource with each application."
sources:
  - label: "MDN, PATCH request method"
    url: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods/PATCH
---

For a PUT I'd start from the documented replacement representation. I'd test the full request and check what the contract says to do when a field is omitted. For a PATCH I'd check the rules of the accepted patch format, including whether an explicit null clears a field. I read the resource back after both requests and compare fields I expected to change and fields I expected to keep.

### Example

Suppose a customer's settings include a time zone and an optional display name. If our partial update promises to leave omitted fields alone, changing the name must preserve the time zone. To clear the name I'd use the operation the contract defines, then check what a fresh settings read returns.
