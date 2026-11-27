---
title: A workshop link still works after registration closes. How would you find why it didn't expire?
topic: system-design
roles: [sdet]
level: senior
type: scenario
oneLine: At closing, I'd compare where a fresh lookup and a saved lookup send the browser. I'd use that difference to find where the problem starts.
looksFor:
  - Test at closing with and without a saved lookup and record where the redirect came from.
  - Compare the saved workshop and expiry with the cached copy to find which one is wrong.
  - Check that assigning another workshop a code can't take the existing code away.
  - Require permission for private registration even when someone knows the code.
trap: Clearing the cache before every test and missing the failure visitors can see after using a link.
followUps:
  - question: The link works before closing but slows down after the workshop email goes out. What traffic would you repeat in a test?
    answer: I'd use the expected mix of looking up codes and creating new ones. I'd include both popular and rarely used codes. I'd compare lookup times with their own target.
sources:
  - label: IETF HTTP semantics, Location response field
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.2
  - label: MITRE guidance on preventing untrusted redirects
    url: https://cwe.mitre.org/data/definitions/601.html#Potential_Mitigations
---

I'd set the clock just before closing and then at closing. I'd compare a lookup that uses a cache, a saved result from an earlier visit, with a fresh lookup. I'd record each response before following any redirect, which sends the browser to another address. If only the previously visited link still redirects, I'd check when its cached result expires. If both redirect, I'd compare the saved expiry time with the clock the lookup uses.

Before closing, I'd read the saved destination. I'd check that the `Location` header, which tells the browser where to go, keeps the session filter and any encoded characters. I'd check whether assigning a code to another workshop could replace this record. I'd check that saving an invalid or unapproved destination fails. If the session is private, I'd require permission and protections against guessed codes.

### Example

I'd use a workshop link that filters the page to a session and expires at closing. Just before closing, I'd expect the filtered page to open. At closing, I'd expect the expired-link reply with no redirect, even after several earlier visits.
