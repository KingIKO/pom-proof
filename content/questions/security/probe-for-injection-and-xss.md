---
title: How would you check that a profile name stays data when the app stores and shows it?
topic: security
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: I'd check that the database receives the name as a value. I'd also check that each screen handles the name safely for where it appears.
looksFor:
  - Explain how the database reads a query and how a browser displays text.
  - Check that the app passes the name as a value separate from the query.
  - Check each place the name appears instead of applying the same rules everywhere.
  - Enter ordinary punctuation and check that saving and reading the name keeps it intact.
trap: Blocking every apostrophe and angle bracket and assuming that makes the rest of the flow safe.
followUps:
  - question: Where would you apply output encoding?
    answer: I'd apply output encoding at the output boundary, the point where the name goes to a destination. I'd choose an encoder that keeps characters safe for that destination. I'd store the plain name so a later plain-text export doesn't include HTML escape sequences.
sources:
  - label: OWASP SQL injection prevention and parameterized queries
    url: https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
  - label: OWASP XSS prevention and output contexts
    url: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html
---

I'd check how the app sends the name to the database. It must pass the name as a parameter, which supplies a value separately from the SQL command. I'd review how the app binds the parameter, or supplies that value. I'd test with a valid name that contains an apostrophe.

I'd also check how the browser shows the name. The browser must never treat user text as code it can run. I'd check that a plain profile name appears as text in each place that shows it. I'd check the output encoding, which keeps characters from taking on special meaning where the name appears.

After a successful save, I'd read back the stored value. I'd check both the edit form and the public profile. I'd keep the test cases in a separate test setup so I can catch the same problem if it returns.

### Example

I'd use `O'Neil <Home>` as a made-up name. I'd expect the database to keep it exactly as I entered it. I'd check that I can see the punctuation in the editor and on the profile page. The browser should show the angle brackets as text without turning that part into a new page element.
