import type { Question, Source } from '../types';

const src = (label: string, url: string): Source => ({ label, url });
const PG = 'https://www.postgresql.org/docs/current/';

const questions: Question[] = [
  {
    id: 'q-sql-001',
    topic: 'SQL for testers',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'What is the difference between an INNER JOIN and a LEFT JOIN, and how would you use one to find orphaned records?',
    answer:
      'An INNER JOIN returns only rows that have a match on both sides. A LEFT JOIN returns every row from the left table, and fills the right side with NULLs when there is no match.\n\nThat makes LEFT JOIN useful for data checks. To find order items whose order no longer exists, I select from order_items, left join orders on the order id, and keep rows where the orders id IS NULL. Any row returned is an orphan, which usually points to a missing foreign key or a delete that did not cascade the way the team expected.',
    lookFor: [
      'States that INNER keeps only matches and LEFT keeps all left rows',
      'Explains the NULL fill on the unmatched side',
      'Writes the LEFT JOIN plus IS NULL pattern for orphans',
      'Links orphans to a likely root cause such as a missing constraint',
    ],
    mistakes: ['Putting a condition on the right table in WHERE and accidentally turning the LEFT JOIN into an inner join'],
    followUps: ['How would you write the same check with NOT EXISTS?'],
    sources: [src('PostgreSQL: Joined tables', PG + 'queries-table-expressions.html#QUERIES-JOIN')],
  },
  {
    id: 'q-sql-002',
    topic: 'SQL for testers',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Junior',
    type: 'Concept',
    question: 'Why does WHERE email = NULL return no rows, and how does NULL affect COUNT?',
    answer:
      'NULL means unknown, so comparing anything to NULL with = gives NULL rather than true, and WHERE only keeps rows where the condition is true. The correct test is email IS NULL, or IS NOT NULL for the opposite.\n\nCounting has a similar trap. COUNT(*) counts rows, while COUNT(email) counts only rows where email is not null. When I verify a report like "customers without an email", I check that the query uses IS NULL and that the count uses the right form, because mixing them gives numbers that look plausible but are wrong.',
    lookFor: [
      'Explains that comparison with NULL yields NULL, not true',
      'Uses IS NULL and IS NOT NULL',
      'Knows COUNT(*) and COUNT(column) differ on NULLs',
      'Relates it to verifying a real report',
    ],
    mistakes: ['Assuming an empty string and NULL are the same thing'],
    followUps: ['What does AVG do with NULL values in the column?'],
    sources: [
      src('PostgreSQL: Comparison functions and operators', PG + 'functions-comparison.html'),
      src('PostgreSQL: Aggregate functions', PG + 'functions-aggregate.html'),
    ],
  },
  {
    id: 'q-sql-003',
    topic: 'SQL for testers',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'A dashboard shows total revenue per day. How would you verify the numbers against the database?',
    answer:
      'I first get the business definition: which order statuses count, whether refunds are subtracted, and which timezone defines a day. Then I write my own query independently, summing the amount and grouping by the order date converted to that timezone, with the same status filter.\n\nI compare my results with the dashboard for a few days, including a day with a refund and orders placed near midnight, since those expose timezone and filter bugs. If numbers differ, I narrow down by listing the individual orders for one day and finding which rows are included in one result but not the other.',
    lookFor: [
      'Clarifies the business definition before writing SQL',
      'Writes an independent query rather than copying the app\'s query',
      'Uses GROUP BY with the correct date handling',
      'Picks edge days such as refunds and midnight orders',
      'Explains how to narrow down a mismatch',
    ],
    mistakes: ['Reusing the application\'s own query, which repeats any bug it has'],
    followUps: ['How would you automate this comparison so it runs every night?'],
    sources: [
      src('PostgreSQL: Aggregate functions tutorial', PG + 'tutorial-agg.html'),
      src('PostgreSQL: Date/time functions (AT TIME ZONE)', PG + 'functions-datetime.html'),
    ],
  },
  {
    id: 'q-sql-004',
    topic: 'SQL for testers',
    roles: ['manual', 'automation', 'sdet'],
    level: 'Mid',
    type: 'Scenario',
    question: 'Users report getting two welcome emails. You suspect duplicate accounts. How do you check, and what would you report?',
    answer:
      'I would group the users table by a normalized email, such as lower(email), and keep groups with HAVING COUNT(*) > 1. That lists every duplicated address with its count. Then I pull the full rows for a few of them and compare creation times, since duplicates created milliseconds apart suggest a double submit or a retry race.\n\nIn the report I include the query, the number of affected accounts, examples, and the likely cause. I would also point out that a unique constraint or unique index on the normalized email would let the database reject duplicates, which is a stronger fix than a check in application code.',
    lookFor: [
      'Uses GROUP BY with HAVING COUNT(*) > 1',
      'Normalizes case or whitespace before grouping',
      'Looks at timestamps to infer the cause',
      'Recommends a database constraint as part of the fix',
    ],
    mistakes: ['Deleting duplicates directly in a shared database while investigating'],
    followUps: ['How would you test that the fix prevents duplicates under concurrent sign-ups?'],
    sources: [
      src('PostgreSQL: GROUP BY and HAVING', PG + 'queries-table-expressions.html#QUERIES-GROUP'),
      src('PostgreSQL: Unique constraints', PG + 'ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS'),
    ],
  },
  {
    id: 'q-sql-005',
    topic: 'SQL for testers',
    roles: ['automation', 'sdet'],
    level: 'Mid',
    type: 'Concept',
    question: 'A query using NOT IN (subquery) suddenly returns no rows at all. What is a likely cause?',
    answer:
      'If the subquery returns even one NULL, NOT IN cannot be true for any row. The check becomes "value is not equal to each item", and comparing to the NULL gives unknown, so every row is filtered out. The query does not fail; it just returns nothing.\n\nThe fix is either to filter NULLs out of the subquery or, more cleanly, to rewrite it with NOT EXISTS and a correlated condition, which does not have this problem. As a tester I watch for this when a data check that used to find problems suddenly reports zero, because zero can mean a broken check rather than clean data.',
    lookFor: [
      'Identifies a NULL in the subquery as the cause',
      'Explains why the result is unknown rather than true',
      'Suggests NOT EXISTS or filtering NULLs',
      'Treats a sudden zero result with suspicion',
    ],
    mistakes: ['Assuming an empty result proves the data is clean'],
    followUps: ['How could you make a data check fail loudly when it has stopped working?'],
    sources: [src('PostgreSQL: Subquery expressions (NOT IN, EXISTS)', PG + 'functions-subquery.html')],
  },
  {
    id: 'q-sql-006',
    topic: 'SQL for testers',
    roles: ['automation', 'sdet', 'lead'],
    level: 'Senior',
    type: 'Scenario',
    question: 'Automated tests share one database and keep interfering with each other. How would you manage test data?',
    answer:
      'I want each test to own its data. Where the test talks to the database directly, I wrap it in a transaction and roll back at the end, so nothing persists. That does not work when the application commits through its own connection, so there I create uniquely named data per test, such as a run id in names and emails, and clean it up by that id.\n\nI avoid tests that depend on rows another test created. For parallel runs, I either give each worker its own schema or database, or make sure no two tests touch the same records. Reference data that rarely changes is seeded once by a migration.',
    lookFor: [
      'Gives each test its own data',
      'Uses transactions with rollback where they apply',
      'Knows rollback fails when the app commits on its own connection',
      'Handles parallel workers explicitly',
      'Separates static reference data from per-test data',
    ],
    mistakes: ['Truncating shared tables between tests while other suites are running'],
    followUps: ['What does the default isolation level mean for a test that reads data another session is writing?'],
    sources: [
      src('PostgreSQL: Transactions tutorial', PG + 'tutorial-transactions.html'),
      src('PostgreSQL: Transaction isolation', PG + 'transaction-iso.html'),
    ],
  },
];

export default questions;
