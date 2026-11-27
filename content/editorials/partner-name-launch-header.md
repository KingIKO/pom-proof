---
problem: bug-report/partner-name-launch-header
---

## What is going on

The English invitation preview uses the retired Oakline General name in its header. Registration completes with the same invitation. The partner agreement still requires Oakline Mutual to appear before today's launch.

## The answer

1. Set severity to S4, a presentation error with no task impact.

   **Why:** The wrong name is visible, but the evidence shows that using the invitation and completing registration still work.

2. Set priority to P0, before today's launch.

   **Why:** The name is an explicit launch condition. The agreement makes the fix urgent even though the task still works.

3. Route the ticket to the partner landing page.

   **Why:** The header appears before registration begins, so the observed symptom belongs to the landing experience.

4. Use the title “Partner landing header shows the retired company name.”

   **Why:** The location and symptom are easy to find and scan. Keep Firefox 138 and staging build 615 in the environment notes.

5. Sign in to the staging preview console, select the launch campaign, open its generated preview, then compare its loaded header with the approved name.

   **Why:** That route produces the screenshot in question. Repeating registration may help check impact, but adds no evidence about how the header looks before signup.

6. Ask for the campaign ID and a redacted preview URL showing the locale and route.

   **Why:** Those details select the same preview among several campaigns without sharing invitation credentials.

7. Record Oakline Mutual as expected and Oakline General as actual in the header.

   **Why:** The approved and observed strings make the correction testable without assumptions about which campaign setting supplied the label.

## Why the tempting answer fails

S2 carries the release urgency into the functional impact rating and wrongly suggests registration is blocked. P0 still fits. The long title buries the symptom in environment and navigation detail. Keep the campaign ID request but replace the known build with the redacted route. The component, steps and exact name comparison still work.

## What the interviewer listens for

Explain why severity and priority are separate fields. Show how a presentation error can legitimately block today's launch.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
