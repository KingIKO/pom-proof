---
problem: bug-report/partner-name-launch-header
---

## What is going on

The English invitation preview shows the retired name, Oakline General, in its header. Registration still completes with the same invitation. The partner agreement still requires the approved name, Oakline Mutual, to appear before today's launch.

## The answer

1. Set severity to S4, a presentation error with no task impact.

   **Why:** Severity describes how much the defect affects what users can do. The wrong name is visible. The evidence shows that using the invitation and completing registration still work.

2. Set priority to P0, before today's launch.

   **Why:** Priority says how soon to fix the defect. The name is an explicit launch condition. The agreement makes the fix urgent even though the task still works.

3. Route the ticket to the partner landing page.

   **Why:** The header appears before registration begins. So the observed symptom belongs to the landing page.

4. Choose a title that says the partner landing page header still shows the retired company name.

   Keep Firefox 138 and staging build 615 in the environment notes.

   **Why:** Readers can find and scan the location and symptom easily. The environment notes preserve what the reader needs to repeat the test.

5. Compare the launch campaign's generated preview header with the approved name.

   Sign in to the staging preview console and select the launch campaign. Open its generated preview. Once it loads, check the header.

   **Why:** That route produces the screenshot in question. Repeating registration may help check impact. It adds no evidence about how the header looks before signup.

6. Ask for the campaign ID and a redacted preview URL that shows the locale and route.

   **Why:** A redacted URL has private parts removed. The locale is the language and region setting, and the route is the page path. Those details select the same preview among several campaigns. They do this without sharing invitation credentials.

7. Record Oakline Mutual as expected and Oakline General as actual in the header.

   **Why:** The approved and observed names make the correction testable. Nobody needs to assume which campaign setting supplied the label.

## Why the tempting answer fails

The decoy's S2 mixes the release urgency into the functional impact rating. It also wrongly suggests that registration is blocked. P0 still fits. The long title hides the symptom among environment and navigation details.

Keep the request for the campaign ID. The build is already known, so ask for the redacted route instead. The decoy's component, steps and exact name comparison still work.

## What the interviewer listens for

Explain why severity and priority are separate fields. Show how a presentation error can rightly block today's launch.

## Sources

- [ISTQB CTFL: defect management](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
