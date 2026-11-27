---
problem: test-design/claim-attachment-policy
---

## What is going on

For a PDF, both the picker and the claimant's verification status matter. Images can use either picker, whether or not the claimant is verified. The function checks only the file name and the policy inputs. So these tests make no claim about what is inside the file. A mutant is a copy of the function with one planted mistake for your tests to catch.

## The answer

1. Build a four-row pairwise matrix across file category, picker, and verification.

   Accept verified `receipt.pdf` through browse. Reject unverified `receipt.pdf` through camera. Accept unverified `damage.png` through browse and verified `damage.jpg` through camera.

   **Why:** Using both image extensions catches the mutant that leaves out JPG. The unverified PNG catches the mutant that requires verification for images. A pairwise matrix covers each pair of values from any two inputs at least once. Treating PDF and image as the two file category partitions, groups of files the policy treats alike, keeps the matrix to four rows.

2. Reject verified `receipt.pdf` through camera and unverified `receipt.pdf` through browse.

   **Why:** These two rows catch the mutant that allows camera PDFs and the one that accepts unverified PDFs separately. The rejected PDF in the matrix has two reasons to fail. Removing either rule alone could go unnoticed there.

3. Test five file names for a verified claimant using browse.

   Accept `receipt.PDF` and `receipt.signed.pdf`. Reject `.pdf`, `receipt.pdf.txt`, and `receipt`.

   **Why:** The first two names catch an extension check that is case-sensitive and one that reads from the first dot. The bare extension catches the mutant that accepts an empty file name stem, the part before the dot. The other two rejections test an unsupported final extension and a missing extension apart from the picker restrictions.

## Why the tempting answer fails

The decoy, the tempting set of rows, uses a normal PDF and a JPEG, which can catch a missing format. Its plain text file shows that one unsupported extension is rejected. All three rows use verified claimants. None can catch a PDF allowed through camera, a PDF allowed without verification, or images that wrongly require verification. The simple names also leave the last-dot and letter-case behavior untested.

## What the interviewer listens for

Explain what the pairwise reduction covers. Then name the extra rows you need so that one PDF restriction cannot hide that the other one is missing.

## Sources

- [NIST, interactions involved in software failures](https://csrc.nist.gov/Projects/automated-combinatorial-testing-for-software/combinatorial-methods-in-testing/interactions-involved-in-software-failures)
- [ISTQB CTFL syllabus v4.0.1, section 4.2.1, equivalence partitioning](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf)
