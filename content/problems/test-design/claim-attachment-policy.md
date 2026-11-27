---
title: Check which files a claimant can attach
kind: test-design
topic: combinatorial-testing
difficulty: hard
minutes: 14
roles: [manual-qa, automation, sdet, senior]
exportName: canAttach
params:
  - { name: fileName, type: string, label: Name of file }
  - { name: picker, type: enum, label: How the file was chosen, values: [browse, camera] }
  - { name: verified, type: boolean, label: Identity verified }
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
    teaches: Choose a PDF with the camera after the claimant verifies their identity.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && verified;
      }
  - name: allows-unverified-pdf
    teaches: Choose a PDF with the file browser before the claimant verifies their identity.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse';
      }
  - name: requires-verification-for-images
    teaches: Choose an image of an allowed type before the claimant proves their identity.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return verified;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: compares-case-sensitively
    teaches: Switch letters in an allowed extension between uppercase and lowercase. Keep the other upload options valid.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1);
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: reads-first-dot
    teaches: Add an extra dot in the name before an allowed extension.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.indexOf('.');
        if (dot <= 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: accepts-empty-stem
    teaches: Use a dot and an allowed extension with nothing before the dot.
    implementation: |
      export function canAttach(fileName, picker, verified) {
        const dot = fileName.lastIndexOf('.');
        if (dot < 0) return false;
        const extension = fileName.slice(dot + 1).toLowerCase();
        if (extension === 'png' || extension === 'jpg') return true;
        return extension === 'pdf' && picker === 'browse' && verified;
      }
  - name: omits-jpg-support
    teaches: Run a separate test for each allowed image extension.
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

A claims app lets users choose an attachment in two ways: `browse` to select a file or `camera` to use the camera. The `canAttach(fileName, picker, verified)` function takes a file name without its folder path. It also takes the way the user chose the file and whether the claimant verified their identity.

The extension is the part of the file name after its last dot. Treat uppercase and lowercase letters in the extension the same. Reject names with no dot or with a dot at the end. At least one character must come before the last dot. The only allowed extensions are `png`, `jpg`, and `pdf`.

- The function accepts `png` and `jpg` with either method. The claimant can use these types without verifying their identity.
- For `pdf`, the claimant must verify their identity and use `browse`.

The function checks only the attachment options and file name. If the rules allow the file, it returns `true`. Otherwise it returns `false`.

Enter test rows or write the JavaScript function `export function test(canAttach)`. If the result differs from what you expected, throw an error.
