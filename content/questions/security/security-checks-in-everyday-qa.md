---
title: A portal viewer can read an invoice but must never export the whole account. What should QA own?
topic: security
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: I'd make invoice access, export denial, and sign-out repeatable tests. I'd send findings that need a deeper review to the teams responsible.
looksFor:
  - Check that the server lets a viewer read their invoice and blocks their full account export.
  - Check that the same session loses invoice access after sign-out or when it expires.
  - Check logs for test session values and compare reply headers with the portal's requirements.
  - Name which findings need a security specialist rather than a QA sign-off.
trap: Treating the OWASP Top 10 as proof that the portal is secure after you check every item.
followUps:
  - question: The portal's invoice library gets a dependency alert. What would you give the owner before they decide how to handle it?
    answer: A dependency alert flags a risk in a library the portal uses. I'd record the affected version and the service that owns it. I'd describe what I can show about exposure. I'd send the finding to the owner and the security team so they can decide what to do.
sources:
  - label: OWASP Top 10, broken access control
    url: https://top10.owasp.org/2025/A01_2025-Broken_Access_Control/
  - label: OWASP ASVS, security verification requirements
    url: https://asvs.owasp.org/
  - label: OWASP logging, data to exclude
    url: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html#data-to-exclude
  - label: OWASP HTTP response headers
    url: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
---

I'd use one smoke run, a quick check of basic behavior, to test the viewer's invoice read and blocked export. I'd check that the server also blocks reads after sign-out or when the session expires. I'd search the log for a made-up session value that represents the viewer's sign-in. I'd compare response headers, the details sent alongside each reply, with the portal's rules. I'd check that the browser shows punctuation in an invoice name as text.

I'd use the OWASP Top 10, a list of common web security risks, to look for gaps beyond this flow. I'd review findings about outside libraries with the service owner. If my repeatable tests pass, they give me evidence about those safeguards in this build. QA sign-off records whether those checks passed. I'd ask a security specialist to assess risks that need a wider or deeper review.

### Example

I'd use a separate test portal with made-up invoices. I'd check that a viewer can read their invoices and cannot export the organization's full list. After I sign out, I'd check that the same session can no longer read the viewer's invoices.
