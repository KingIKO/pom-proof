---
title: Check subscription renewals across short months
kind: test-design
topic: date-testing
difficulty: hard
minutes: 15
roles: [manual-qa, automation, sdet, senior]
exportName: nextRenewalDate
params:
  - { name: year, type: number, label: Current billing year }
  - { name: month, type: number, label: Current billing month }
  - { name: billingDay, type: number, label: Original billing day }
implementation: |
  function lastDay(year, month) {
    if (month === 2) {
      const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 > 0);
      return leap ? 29 : 28;
    }
    return [4, 6, 9, 11].includes(month) ? 30 : 31;
  }
  export function nextRenewalDate(year, month, billingDay) {
    const nextYear = month === 12 ? year + 1 : year;
    const nextMonth = month === 12 ? 1 : month + 1;
    const day = Math.min(billingDay, lastDay(nextYear, nextMonth));
    return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
mutants:
  - name: carries-shortened-billing-day
    teaches: Move from a short billing month to a month with room for the original billing day.
    implementation: |
      function lastDay(year, month) {
        if (month === 2) {
          const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 > 0);
          return leap ? 29 : 28;
        }
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
      }
      export function nextRenewalDate(year, month, billingDay) {
        const nextYear = month === 12 ? year + 1 : year;
        const nextMonth = month === 12 ? 1 : month + 1;
        const day = Math.min(billingDay, lastDay(year, month), lastDay(nextYear, nextMonth));
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
  - name: overlooks-april-length
    teaches: Try a billing day past the end of April as the next billing month.
    implementation: |
      function lastDay(year, month) {
        if (month === 2) {
          const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 > 0);
          return leap ? 29 : 28;
        }
        return [6, 9, 11].includes(month) ? 30 : 31;
      }
      export function nextRenewalDate(year, month, billingDay) {
        const nextYear = month === 12 ? year + 1 : year;
        const nextMonth = month === 12 ? 1 : month + 1;
        const day = Math.min(billingDay, lastDay(nextYear, nextMonth));
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
  - name: ignores-leap-days
    teaches: Use a late billing day in January of a leap year.
    implementation: |
      function lastDay(year, month) {
        if (month === 2) return 28;
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
      }
      export function nextRenewalDate(year, month, billingDay) {
        const nextYear = month === 12 ? year + 1 : year;
        const nextMonth = month === 12 ? 1 : month + 1;
        const day = Math.min(billingDay, lastDay(nextYear, nextMonth));
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
  - name: treats-all-multiples-of-four-as-leap
    teaches: Renew into February of a century year that is not a leap year.
    implementation: |
      function lastDay(year, month) {
        if (month === 2) return year % 4 === 0 ? 29 : 28;
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
      }
      export function nextRenewalDate(year, month, billingDay) {
        const nextYear = month === 12 ? year + 1 : year;
        const nextMonth = month === 12 ? 1 : month + 1;
        const day = Math.min(billingDay, lastDay(nextYear, nextMonth));
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
  - name: excludes-all-century-years
    teaches: Renew into February of a century year that still qualifies as a leap year.
    implementation: |
      function lastDay(year, month) {
        if (month === 2) {
          const leap = year % 4 === 0 && year % 100 > 0;
          return leap ? 29 : 28;
        }
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
      }
      export function nextRenewalDate(year, month, billingDay) {
        const nextYear = month === 12 ? year + 1 : year;
        const nextMonth = month === 12 ? 1 : month + 1;
        const day = Math.min(billingDay, lastDay(nextYear, nextMonth));
        return `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
  - name: keeps-year-in-december
    teaches: Start in the last month of the year and assert the year as well as the day.
    implementation: |
      function lastDay(year, month) {
        if (month === 2) {
          const leap = year % 400 === 0 || (year % 4 === 0 && year % 100 > 0);
          return leap ? 29 : 28;
        }
        return [4, 6, 9, 11].includes(month) ? 30 : 31;
      }
      export function nextRenewalDate(year, month, billingDay) {
        const nextMonth = month === 12 ? 1 : month + 1;
        const day = Math.min(billingDay, lastDay(year, nextMonth));
        return `${year}-${String(nextMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
reference:
  source: |
    export function test(nextRenewalDate) {
      const cases = [
        [2025, 1, 31, '2025-02-28'], [2024, 1, 31, '2024-02-29'],
        [1900, 1, 31, '1900-02-28'], [2000, 1, 31, '2000-02-29'],
        [2025, 2, 31, '2025-03-31'], [2025, 3, 31, '2025-04-30'],
        [2025, 12, 7, '2026-01-07'], [2025, 5, 15, '2025-06-15'],
      ];
      for (const [year, month, billingDay, expected] of cases) {
        const actual = nextRenewalDate(year, month, billingDay);
        if (actual === expected) continue;
        throw new Error(`${year}-${month}, original day ${billingDay}: expected ${expected}, got ${actual}`);
      }
    }
rowsReference:
  rows:
    - { args: [2025, 1, 31], expected: '2025-02-28' }
    - { args: [2024, 1, 31], expected: '2024-02-29' }
    - { args: [1900, 1, 31], expected: '1900-02-28' }
    - { args: [2000, 1, 31], expected: '2000-02-29' }
    - { args: [2025, 2, 31], expected: '2025-03-31' }
    - { args: [2025, 3, 31], expected: '2025-04-30' }
    - { args: [2025, 12, 7], expected: '2026-01-07' }
    - { args: [2025, 5, 15], expected: '2025-06-15' }
decoy:
  rows:
    - { args: [2025, 1, 31], expected: '2025-02-28' }
    - { args: [2025, 5, 15], expected: '2025-06-15' }
    - { args: [2025, 12, 15], expected: '2026-01-15' }
---

`nextRenewalDate(year, month, billingDay)` returns the next monthly billing date as a `YYYY-MM-DD` string, with a two-digit month and day. Inputs are whole numbers: the current billing year from 1900 through 2099, the current month from 1 through 12, and the original billing day from 1 through 31.

- Move to the next calendar month. December moves to January of the following year.
- Use the original billing day if it exists in the next month. Otherwise use that month's last day. A short month never changes the original billing day.
- Use the Gregorian calendar. April, June, September and November have 30 days. February has 28 days, or 29 in a leap year. A year divisible by 4 is a leap year unless divisible by 100, in which case it must also be divisible by 400. All other months have 31 days.

Enter test rows or write a JavaScript `export function test(nextRenewalDate)` that throws on an unexpected result.
