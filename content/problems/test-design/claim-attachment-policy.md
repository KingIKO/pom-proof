---
title: Check upload options for claim attachments
kind: test-design
topic: combinatorial-testing
difficulty: hard
minutes: 14
roles: [manual-qa, automation, sdet, senior]
exportName: canAttach
params:
  - { name: fileName, type: string, label: File name }
  - { name: picker, type: enum, label: Picker, values: [browse, camera] }
  - { name: verified, type: boolean, label: Claimant verified }
implementation: |
  export function canAttach(fileName, picker, verified) {
    const dot = fileName.lastIndexOf('.');
    if (dot <= 0) return false;
    const extension = fileName.slice(dot + 1).toLowerCase();
    if (extension === 'png' || extension === 'jpg') return true;
    return extension === 'pdf' && picker === 'browse' && verified;
  }
mutants:
  - name: allows-camera-pdf
    teaches: Try a PDF from the camera with a verified claimant.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && verified;
      }
  - name: allows-unverified-pdf
    teaches: Try a PDF from the file browser with an unverified claimant.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse';
      }
  - name: requires-verification-for-images
    teaches: Try an allowed image before the claimant verifies their identity.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return verified;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: compares-case-sensitively
    teaches: Change the case of a supported extension while keeping the upload options valid.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1);
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: reads-first-dot
    teaches: Try a name with an extra dot before a supported final extension.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.indexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: accepts-empty-stem
    teaches: Try a bare supported extension with no file name before its dot.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot < 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: omits-jpg-support
    teaches: Test both allowed image extensions as separate inputs.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png') return true;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
reference:
  source: |
    export function test(canAttach) {
      const cases = [
        ['receipt.pdf', 'browse', true, true], ['receipt.pdf', 'camera', false, false],
        ['damage.png', 'browse', false, true], ['damage.jpg', 'camera', true, true],
        ['receipt.pdf', 'camera', true, false], ['receipt.pdf', 'browse', false, false],
        ['receipt.PDF', 'browse', true, true], ['receipt.signed.pdf', 'browse', true, true],
        ['.pdf', 'browse', true, false], ['receipt.pdf.txt', 'browse', true, false],
        ['receipt', 'browse', true, false],
      ];
      for (const [fileName, picker, verified, expected] of cases) {
        const actual = canAttach(fileName, picker, verified);
        if (actual === expected) continue;
        throw new Error(`${fileName}, ${picker}, verified ${verified}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [receipt.pdf, browse, true], expected: true }
    - { args: [receipt.pdf, camera, false], expected: false }
    - { args: [damage.png, browse, false], expected: true }
    - { args: [damage.jpg, camera, true], expected: true }
    - { args: [receipt.pdf, camera, true], expected: false }
    - { args: [receipt.pdf, browse, false], expected: false }
    - { args: [receipt.PDF, browse, true], expected: true }
    - { args: [receipt.signed.pdf, browse, true], expected: true }
    - { args: [.pdf, browse, true], expected: false }
    - { args: [receipt.pdf.txt, browse, true], expected: false }
    - { args: [receipt, browse, true], expected: false }
decoy:
  rows:
    - { args: [receipt.pdf, browse, true], expected: true }
    - { args: [damage.jpg, camera, true], expected: true }
    - { args: [notes.txt, browse, true], expected: false }
---

A claims app has two attachment pickers, `browse` and `camera`. Test `canAttach(fileName, picker, verified)`, which returns `true` if the policy allows the attachment and `false` otherwise. It receives a file name without a directory path, one of the two pickers, and whether the claimant has verified their identity.

Use the part after the last dot as the extension, ignoring letter case. There must be at least one character before that dot. A name without a dot, a name ending in a dot, and all extensions other than `png`, `jpg`, and `pdf` are rejected.

- `png` and `jpg` are accepted with either picker, regardless of verification.
- `pdf` is accepted only through `browse` for a verified claimant.

The function checks the attachment options and file name only. Enter test rows or write a JavaScript `export function test(canAttach)` that throws on an unexpected result.
