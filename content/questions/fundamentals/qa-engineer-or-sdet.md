---
title: Two automated test jobs use the same sample class roster. How would you share the work of finding the problem?
topic: fundamentals
roles: [manual-qa, automation, sdet]
level: junior
type: concept
oneLine: I'd find out what the roster should show after a transfer. I'd also check whether another test job replaced the sample roster.
looksFor:
  - Tell a change in the file the app produced apart from a change in the sample data.
  - Say what the school office expects the roster to show after a transfer.
  - Give each job its own data and test the fix with both jobs running.
  - Show how the two roles can work together and review the fix.
trap: Using the job title to rank people by experience or assuming quality assurance engineers never write code.
followUps:
  - question: If the tests pass when only one job runs, what would you check before closing the bug report?
    answer: I'd run both jobs at once with separate sample rosters. I'd check that each file lists the student transferred in its own test.
sources:
  - label: ISTQB CTFL v4.0.1, sections 1.4.5 and 1.5.2, role variation and shared quality
    url: https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf
---

I'd check whether both jobs exported the rosters they started with. An export is a file the app writes with its data. I'd have one person trace the starting data that the test runner loaded. I'd have the other check which class the roster should show after a transfer. Then I'd compare their findings to see whether the output or the test data changed.

An SDET is a software development engineer in test who writes or maintains test tools. If they own the runner on this team, I'd ask them to review the fix to the test data. I'd ask the quality assurance (QA) engineer for the transfer case so they can share responsibility for the check. Someone who mostly tests by hand could help fix the data as a first step toward maintaining test tools. I'd base the split on how the team works.

### Example

If two jobs share a sample roster, I'd ask one person to check the transfer case. I'd ask the other to give each job separate data. A tester moving into SDET work could make that change and show that both jobs pass when they run at the same time.
