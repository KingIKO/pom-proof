import type { DiagnoseItem } from '../../types';

const item: DiagnoseItem = {
  id: 'ci-timezone-date',
  title: 'Diagnose a date that shifts in CI',
  kind: 'diagnose',
  difficulty: 'Medium',
  topics: ['CI', 'Time zones', 'Test determinism'],
  roles: ['automation', 'sdet'],
  summary: 'Explain why a fixed instant produces a different date on two hosts.',
  prompt: 'The receipt export contract uses the merchant’s `America/Los_Angeles` business date. The same test passes on a developer laptop and fails in CI. Use the fixed timestamp, snippet and host logs to explain the discrepancy.',
  lang: 'python',
  code: `
from datetime import datetime

def receipt_business_date(issued_at):
    return issued_at.astimezone().date().isoformat()

def test_receipt_uses_merchant_date():
    issued_at = datetime.fromisoformat("2026-02-15T02:30:00+00:00")
    assert receipt_business_date(issued_at) == "2026-02-14"`,
  log: `Laptop: local zone America/Los_Angeles, local time 2026-02-14 18:30 -0800
PASSED test_receipt_uses_merchant_date

CI: local zone UTC, local time 2026-02-15 02:30 +0000
AssertionError: assert '2026-02-15' == '2026-02-14'`,
  questions: [
    {
      prompt: 'What accounts for the two dates?',
      options: [
        { text: 'The input uses the laptop’s current clock.', why: 'The timestamp is a fixed aware datetime created from a literal ISO string.' },
        { text: 'The input’s UTC offset means the result must always stay in UTC.', why: 'The input identifies an instant, and astimezone converts it to another zone before the date is taken.' },
        { text: 'Calling astimezone without a zone uses the host’s local time zone.', correct: true, why: 'The same instant is before midnight in Los Angeles and after midnight in UTC.' },
        { text: 'CI sorts date strings differently because of locale.', why: 'No comparison or sorting precedes the date conversion, and isoformat uses a fixed numeric representation.' },
      ],
    },
    {
      prompt: 'Which fix expresses the business rule across hosts?',
      options: [
        { text: 'Convert with ZoneInfo("America/Los_Angeles") or a configured merchant zone before taking date.', correct: true, why: 'The test and application agree on a named zone that also represents daylight-saving changes.' },
        { text: 'Change the expected date based on the host the test runs on.', why: 'That would permit the exported business date to change with the deployment environment.' },
        { text: 'Subtract eight hours from every UTC timestamp.', why: 'Los Angeles does not have a fixed UTC offset throughout the year.' },
        { text: 'Compare the first ten characters of the UTC timestamp.', why: 'That gives the UTC date and loses the merchant rule near midnight.' },
      ],
    },
  ],
  hints: ['Find the place where the code chooses a time zone.', 'Keep the expected value tied to the merchant contract, not the CI environment.'],
  solutionNotes: 'Use the merchant’s IANA zone explicitly. Keep the fixed instant in the test, and add a summer case near the date boundary. Include IANA time zone data in environments where it is not supplied by the operating system.',
  interviewNotes: 'Distinguish an instant from a calendar date. Ask what zone the business means by “today” and how it is configured per merchant.',
  sources: [
    { label: 'Python: datetime.astimezone()', url: 'https://docs.python.org/3/library/datetime.html#datetime.datetime.astimezone' },
    { label: 'Python: zoneinfo', url: 'https://docs.python.org/3/library/zoneinfo.html' },
  ],
};

export default item;
