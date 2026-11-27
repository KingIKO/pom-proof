---
title: Test sign-in when an account is locked
kind: scenario
topic: authentication
difficulty: easy
minutes: 7
roles: [manual-qa, automation]
items:
  - id: clarify
    type: multi-select
    prompt: Which questions would you ask before you write the lockout tests?
    choices:
      - { id: wording, text: "Should the heading on the sign-in page say Log in or Sign in?" }
      - { id: count, text: "Which failures count toward the lock, and does a successful login reset the count?" }
      - { id: cooldown, text: "When does the cooldown start, and do attempts during the cooldown make it longer?" }
      - { id: visibility, text: "Should the help link open in the same browser tab or in a new one?" }
  - id: risk
    type: budgeted-pick
    prompt: You have up to nine minutes. Choose checks for when access is denied and when it comes back.
    budget: 9
    choices:
      - { id: restore, cost: 4, text: "Try valid credentials just before the cooldown ends and exactly when it ends." }
      - { id: browsers, cost: 5, text: "Repeat a normal login that succeeds on the first try in two desktop browsers." }
      - { id: trigger, cost: 5, text: "Compare the attempt that triggers the lock with another account that is one failure short." }
      - { id: help, cost: 3, text: "Read the help text that explains the lock on a narrow phone screen." }
  - id: layer
    type: single-choice
    prompt: Which kind of test first checks that the deployed service locks the account on the attempt that reaches the limit?
    choices:
      - { id: ui, text: "An automated UI test" }
      - { id: unit, text: "A unit test" }
      - { id: manual, text: "A manual exploratory test" }
      - { id: api, text: "An API test" }
  - id: recovery-layer
    type: single-choice
    prompt: Which kind of test first checks the exact moment the cooldown ends in the pure cooldown predicate?
    choices:
      - { id: manual, text: "A manual exploratory test" }
      - { id: unit, text: "A unit test" }
      - { id: api, text: "An API test" }
      - { id: ui, text: "An automated UI test" }
  - id: stop
    type: single-choice
    prompt: Which result should block this release?
    choices:
      - { id: tooltip, text: "The help tooltip appears without the fade-in effect it had before." }
      - { id: bypass, text: "Before the cooldown ends, the service creates a session for a locked test account." }
      - { id: supported, text: "Sign-in works at the moment the cooldown ends, with no extra delay." }
      - { id: wrap, text: "On mobile, the lock message wraps onto more lines and all its text stays visible." }
  - id: order
    type: ordering
    prompt: Put the steps in order for one cooldown run on its own test account.
    choices:
      - { id: expire, text: "Move the staging clock to the time when the stated cooldown ends." }
      - { id: denied, text: "During the cooldown, try a valid login and record that it is denied." }
      - { id: seed, text: "Create the test account with no failed attempts on record." }
      - { id: allowed, text: "Try a valid login when the cooldown ends, and check that a session is created." }
      - { id: lock, text: "Record the failed attempt that locks the account." }
reference:
  clarify: [count, cooldown]
  risk: [trigger, restore]
  layer: api
  recovery-layer: unit
  stop: bypass
  order: [seed, lock, denied, expire, allowed]
decoy:
  clarify: [count, wording]
  risk: [browsers, restore]
  layer: ui
  recovery-layer: ui
  stop: bypass
  order: [seed, lock, denied, expire, allowed]
---

A sign-in service locks an account after repeated wrong passwords. While the account is locked, the service must reject even the correct password. The lock lasts until the cooldown ends. The cooldown is the waiting period before sign-in works again. In staging, you can move the clock, and each run can start with a new test account.

The ticket leaves out the rules for counting failures and for the cooldown. For the timed smoke test, a quick check of the key paths, assume the team has supplied both. The cooldown predicate is a pure function that answers yes or no. It takes the current time and the deadline, and it does not call the service.
