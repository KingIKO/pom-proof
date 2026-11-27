---
problem: bug-report/benefits-form-focus-trap
---

## What is going on

Postal code is required. The defect begins after validation shows the error summary: the keyboard user cannot reach the field to correct it. The screenshot shows the summary and field, but it cannot show where focus goes on successive Tab presses.

## The answer

1. Set severity to S2: a required task is blocked with no supported workaround.

   **Why:** A keyboard-only applicant cannot correct the required field. Switching to a mouse does not restore the supported keyboard path.

2. Set priority to P0, before today's accessibility sign-off.

   **Why:** The release decision depends on having a usable keyboard recovery path today.

3. File against the benefits form and validation summary.

   **Why:** The trap occurs on the form before any submit request reaches the server, giving the eligibility service no role in the observed failure.

4. Use the title “Keyboard focus stays in the benefits form error summary.”

   **Why:** The title makes the affected control and symptom searchable. Keep build 284, Edge 135 and Windows 11 in the environment notes.

5. Open a fresh test application, fill the other required fields, submit with the keyboard with Postal code empty, then press Tab repeatedly from the summary.

   **Why:** This isolates one validation error and tests keyboard recovery after it appears. In a Java regression, send Tab with `new Actions(driver).sendKeys(Keys.TAB).perform()` and record the focused element each time.

6. Add the reproduction count across fresh applications and the focus sequence or a short recording.

   **Why:** One attempt cannot establish repeatability, and the focus evidence shows the loop that the screenshot cannot.

7. Record that Tab should reach the invalid field but cycles inside the summary.

   **Why:** The failed behavior is recovering from a valid error, so filing it as a bad required-field rule would send the investigation in the wrong direction.

## Why the tempting answer fails

S3 assumes a secondary path or reliable workaround. Neither applies to a keyboard-only applicant. The long title buries the trap in details that fit the report body. Keep the reproduction count, but ask for focus evidence instead of requesting the build again. The decoy's P0 and component fit; its steps and expected result also stand.

## What the interviewer listens for

Show the failed recovery path in a way someone else can repeat, and tie the proposed priority to the release decision.

## Sources

- [Selenium: keyboard actions](https://www.selenium.dev/documentation/webdriver/actions_api/keyboard/)
- [W3C: form error notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [W3C: no keyboard trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)
