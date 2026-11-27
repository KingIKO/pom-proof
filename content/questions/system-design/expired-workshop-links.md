---
title: A workshop link still opens after registration closes. What evidence would tell you why?
topic: system-design
roles: [sdet]
level: senior
type: scenario
oneLine: Compare the redirect at closing for a fresh link lookup and a cached one, then isolate the failing layer.
looksFor:
  - Replays the close time with hot and cold lookups and records where the redirect came from.
  - Uses the stored workshop and expiry to distinguish a stale cache entry from a bad record.
  - Checks that a new allocation cannot change who owns the existing short code.
  - Keeps private registration behind authorization even if a short code is known.
trap: Clearing the cache before each test so the bug only customers see is never exercised.
followUps:
  - question: The registration link works before closing, but it takes much longer right after the workshop email goes out. What traffic would you replay?
    answer: I'd replay the expected ratio of lookups to creates with popular and seldom-used codes, and check lookup latency against its own target.
sources:
  - label: IETF HTTP semantics, Location response field
    url: https://www.rfc-editor.org/rfc/rfc9110.html#section-10.2.2
  - label: MITRE guidance on preventing untrusted redirects
    url: https://cwe.mitre.org/data/definitions/601.html#Potential_Mitigations
---

I'd set the clock just before and then at closing. I'd compare an already visited link with
a fresh lookup and record the response before following it. If only the visited link keeps
redirecting, I'd check when the cached entry expires. If both still redirect, I'd compare the
stored expiry and the clock the lookup uses.

Before closing I'd read the stored destination and check that `Location` keeps the session
filter and any encoded characters. I'd also check whether another workshop's code allocation
could have replaced this record. Invalid or unapproved destinations should be rejected when
saved. A private session still needs authorization and safeguards against guessing its code.

### Example

A workshop link includes a session filter and expires when registration closes. It should
open the filtered page just before closing and show the expiry response at closing without
redirecting, even if the link had been visited repeatedly.
