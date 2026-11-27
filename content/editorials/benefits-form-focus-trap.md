---
problem: bug-report/benefits-form-focus-trap
---

## What is going on

The form requires Postal code. When validation shows its summary of errors, a keyboard user cannot reach the field to correct it. The screenshot shows the error summary and the field. It cannot show where focus moves on each Tab press.

## The answer

1. Set the severity to S2.

   **Why:** Severity describes the impact of the defect. S2 means the defect blocks a required task with no supported workaround. A keyboard-only applicant cannot correct the required field. A mouse does not restore the supported keyboard path.

2. Set the priority to P0.

   **Why:** Priority says when to fix the defect. P0 means fixing it before today's accessibility sign-off. The release decision requires a usable keyboard recovery path today.

3. File against the benefits form and validation summary.

   **Why:** The form traps focus before any submit request reaches the server. The eligibility service therefore has no part in the failure you observed.

4. Use the title "Tab keeps keyboard focus inside the benefits form error summary."

   **Why:** The title includes the affected control and what went wrong, so someone can search for either. Put build 284, Edge 135 and Windows 11 in the environment notes.

5. Reproduce the focus loop in a fresh test application by submitting with Postal code empty, then pressing Tab repeatedly from the summary.

   **Why:** Filling the other required fields isolates one validation error. Submitting with the keyboard tests recovery on the supported path. Pressing Tab repeatedly shows the loop. For example, a Java regression test can send Tab with `new Actions(driver).sendKeys(Keys.TAB).perform()` and record which element has focus each time.

6. Add the reproduction count across fresh applications and the focus sequence or a short recording.

   **Why:** One attempt cannot show how often the failure occurs. The focus sequence or recording shows the loop that the screenshot cannot capture.

7. Record that Tab should reach the invalid field but cycles inside the summary.

   **Why:** The form correctly reports a missing required field. Recovery from that error fails. A report about a bad required-field rule would send the team to investigate working behavior.

## Why the tempting answer fails

S3 assumes a secondary path or a reliable workaround. Neither applies to a keyboard-only applicant. The long title makes the trap harder to see among details that belong in the report body. Keep the reproduction count and ask for focus evidence. The report already has the build number.

Keep the decoy's P0, component, steps, and expected result.

## What the interviewer listens for

Show the failed recovery path so someone else can repeat it. Explain how the release decision sets the priority.

## Sources

- [Selenium: keyboard actions](https://www.selenium.dev/documentation/webdriver/actions_api/keyboard/)
- [W3C: form error notifications](https://www.w3.org/WAI/tutorials/forms/notifications/)
- [W3C: no keyboard trap](https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html)
