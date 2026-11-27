---
title: How would you show that a profile name stays data when it's stored and displayed?
topic: security
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: Verify the database call binds input as data and each display treats that value according to its output context.
looksFor:
  - Distinguishes database query structure from browser rendering.
  - Checks parameters at the query boundary.
  - Covers each output context rather than applying one encoding to every destination.
  - Tests ordinary punctuation as valid data and verifies the stored value survives the round trip.
trap: Rejecting all apostrophes and angle brackets and calling the remaining flow safe.
followUps:
  - question: Where would you apply output encoding?
    answer: At the output boundary, using the encoder appropriate to that destination. I'd keep a plain name as stored data so a later plain-text export doesn't inherit HTML encoding.
sources:
  - label: OWASP SQL injection prevention and parameterized queries
    url: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
  - label: OWASP XSS prevention and output contexts
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
---

I'd check both boundaries. At the database, input must stay a parameter value instead of becoming part of the SQL statement. I'd review the query binding and test with a legal name containing an apostrophe. At the browser, user-controlled text should never become executable content. For a plain profile name I'd check that it lands in a text location, with output handling appropriate to each context that displays it.

One successful save leaves a lot unchecked. I'd read the stored value back and check the edit form as well as the public profile. I'd keep those regression cases on an isolated fixture.

### Example

A synthetic display name is `O'Neil <Home>`. I expect the database to preserve it exactly. On the profile page and in the editor, both punctuation marks should be visible as text and there should be no new element representing the angle-bracketed part.
