---
problem: test-design/claim-attachment-policy
---

Start with pairs across three factors: supported file category, picker, and verification. Use PDF with browse and verified, PDF with camera and unverified, image with browse and unverified, and image with camera and verified. These four rows cover every pair of values in the simplified two-category model.

The PDF rule needs additional rows. The pairwise matrix's rejected PDF has two reasons for rejection, so it still fails even if the app forgets one rule. Add a verified PDF from camera and an unverified PDF from browse. Each should fail for a different reason. Then test the name itself: a supported uppercase extension, a real name with multiple dots, an unsupported final extension, and a bare extension with no name before the dot. Use both supported image extensions.

The weaker answer tries a normal PDF, a JPEG photo, and an unsupported file. That can catch a missing format, but always uses verified claimants and doesn't ask whether the same PDF is allowed through the camera picker. An interviewer listens for both the reduced matrix and the known business rule that requires extra rows. The function only checks the name and policy inputs; a passing suite says nothing about file contents.

Sources: [NIST, interactions involved in software failures](https://csrc.nist.gov/Projects/automated-combinatorial-testing-for-software/combinatorial-methods-in-testing/interactions-involved-in-software-failures) and [ISTQB CTFL Syllabus v4.0.1, section 4.2.1](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf).
