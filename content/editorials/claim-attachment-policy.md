---
problem: test-design/claim-attachment-policy
---

## What is going on

The picker and the claimant's verification status matter for PDFs. Images can use either picker regardless of verification. This function checks only the name and policy inputs, so these tests make no claim about file contents.

## The answer

1. Build a pairwise matrix across file category, picker, and verification. Accept verified PDF through browse, reject unverified PDF through camera, accept unverified PNG through browse, and accept verified JPG through camera.

   **Why:** Treating PDF and image as the two file category partitions keeps the matrix to four rows while covering each pair of values. Using both image extensions catches the mutant that leaves out JPG, and the unverified PNG catches the mutant that requires verification for images.

2. Add a verified PDF through camera and an unverified PDF through browse. Both should be rejected.

   **Why:** The matrix's rejected PDF has two reasons to fail. Removing either rule could go unnoticed. These rows catch, separately, the mutant that allows camera PDFs and the one that accepts unverified PDFs.

3. With a verified claimant using browse, accept `receipt.PDF` and `receipt.signed.pdf`. Reject `.pdf`, `receipt.pdf.txt`, and `receipt`.

   **Why:** The first two catch a case-sensitive extension check and one that reads the first dot. The bare extension catches the mutant that accepts an empty file name stem. The other rejections keep the unsupported final extension and missing extension separate from picker restrictions.

## Why the tempting answer fails

A normal PDF and a JPEG can catch a missing format, and a plain text file can show one unsupported extension is rejected. All three use verified claimants. None can catch a PDF being allowed through camera, a PDF being allowed without verification, or a false verification requirement for images. The simple names leave last-dot and case behavior untested.

## What the interviewer listens for

Explain what the pairwise reduction covers and which extra rows you need so one PDF restriction cannot hide the absence of the other.

## Sources

- [NIST, interactions involved in software failures](https://csrc.nist.gov/Projects/automated-combinatorial-testing-for-software/combinatorial-methods-in-testing/interactions-involved-in-software-failures)
- [ISTQB CTFL syllabus v4.0.1, section 4.2.1, equivalence partitioning](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
