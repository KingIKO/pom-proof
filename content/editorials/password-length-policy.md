---
problem: test-design/password-length-policy
---

Start with ordinary single-code-point letters. Test lengths 11, 12, and 13 around the minimum and 63, 64, and 65 around the maximum. The exact limits must pass. The outside neighbours catch a rule widened by one, and the inside neighbours guard against a check that accepts only the boundary itself.

Then test what the function counts. Ten letters with one space on either side make 12 code points and must pass. Trimming that input changes the result. Ten ordinary letters followed by `𠮷` make 11 code points and must fail. JavaScript's `String.length` counts UTF-16 code units, so it reports 12 for that second input. A supplementary character in the middle of the valid range would give both counting methods the same pass result.

The weaker answer tests an everyday valid password, a clearly short password, and the exact minimum. It never reaches the upper limit or makes the counting rules matter.

An interviewer listens for an exact definition of length before the test data gets written. Keep these checks against the length function. If the interface can trim or truncate the field before submission, test that input path separately against the same product rule.

Sources: [ISTQB CTFL Syllabus v4.0.1, section 4.2.2](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) and [MDN, String length](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/length).
