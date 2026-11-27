---
title: A portal viewer can read an invoice but must never export the whole account. What should QA own?
topic: security
roles: [manual-qa, automation, sdet]
level: mid
type: concept
oneLine: Make the viewer's read, export denial, and sign-out behavior repeatable checks, and send deeper findings to their owners.
looksFor:
  - Confirms a viewer can read their invoice but the server denies the wider export.
  - Checks the same session can't read the invoice after sign-out or expiry.
  - Looks for test session values in logs and verifies the portal's header requirements.
  - Describes which findings need a security specialist rather than a QA sign-off.
trap: Treating the OWASP Top 10 as a checklist that certifies the portal is secure.
followUps:
  - question: The portal's invoice library gets a dependency alert. What would you give the owner before they triage it?
    answer: I'd record the affected version, owning service, and exposure I can substantiate, then route the finding to its owner and the security team for a decision.
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

I'd put the viewer's allowed invoice read and denied account export in the same smoke run.
After sign-out or expiry, the read should also be denied. I'd check the log for the synthetic
session value and check the response headers against the portal's requirements. I'd also
confirm an invoice name with punctuation still renders as text.

I use the OWASP Top 10 to help spot gaps beyond that flow, and review dependency findings
with the service owner. A passing regression suite is evidence about those controls on this
build. A security specialist can assess risks that need broader or deeper examination.

### Example

In an isolated test portal, an account viewer can see their synthetic invoices but cannot export the organization's full invoice list. I'd assert both outcomes, then sign out and confirm the session can no longer access the viewer's invoices.
