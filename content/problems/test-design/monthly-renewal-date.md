---
title: Check renewal dates when months have different lengths
kind: test-design
topic: date-testing
difficulty: hard
minutes: 15
roles: [manual-qa, automation, sdet, senior]
exportName: nextRenewalDate
params:
  - { name: year, type: number, label: Year of current bill }
  - { name: month, type: number, label: Month of current bill }
  - { name: billingDay, type: number, label: Billing day before any adjustment }
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
    teaches: Start in a short month. Move to a month that has the original billing day.
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
    teaches: Make April the next billing month. Use a billing day higher than April's last day.
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
    teaches: Start in January of a leap year and choose a billing day near the end of January.
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
    teaches: Renew into February of a year divisible by 100 that is not a leap year.
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
    teaches: Renew into February of a year divisible by 100 that is also a leap year.
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
    teaches: Start in December. Check both the year and day in the next billing date.
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

The `nextRenewalDate(year, month, billingDay)` function returns the next monthly billing date as text in `YYYY-MM-DD` format. The month and day each use two digits. The current billing year is a whole number from 1900 through 2099. The current month is a whole number from 1 through 12. The original billing day is a whole number from 1 through 31.

- Move to the next calendar month. For December, move to January of the following year.
- If the next month has the original billing day, use it. Otherwise use the last day of that month. Keep the original billing day for future months.
- Use the Gregorian calendar, the standard calendar with January through December. April, June, September and November have 30 days. February has 28 days, or 29 in a leap year. All other months have 31 days.
- If a year is divisible by 100, it is a leap year only if it is also divisible by 400. For other years, any year divisible by 4 is a leap year.

Enter test rows or write the JavaScript function `export function test(nextRenewalDate)`. If the date differs from what you expected, throw an error.
