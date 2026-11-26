import type { DesignRow, TestDesignItem } from '../../types';

const ready = 'Checkout available';
const blocked = 'Payment unavailable';
const result = (unavailable: boolean) => unavailable ? blocked : ready;
const walletBlocked = ({ browser, payment }: DesignRow) => browser === 'Firefox' && payment === 'Wallet';
const transferBlocked = ({ payment, locale }: DesignRow) => payment === 'Bank transfer' && locale === 'fr-CA';
const oracle = (row: DesignRow) => result(walletBlocked(row) || transferBlocked(row));

const item: TestDesignItem = {
  id: 'checkout-pairwise',
  title: 'Pair checkout configurations',
  kind: 'testdesign',
  difficulty: 'Hard',
  technique: 'Pairwise',
  topics: ['Pairwise', 'Compatibility'],
  roles: ['manual', 'automation', 'sdet', 'lead'],
  summary: 'Cover every pair of configuration values without running all 81 combinations.',
  prompt: 'Checkout is tested on three browsers, three operating systems, three payment methods and three locales. Assume all combinations can be tested. The test storefront reports **Payment unavailable** for wallet on Firefox or bank transfer in `fr-CA`. Every other configuration reports **Checkout available**. These are storefront rules for this exercise.\n\nBuild a set where every pair of values across different fields appears at least once. Aim for **9 rows**. Include unavailable configurations and predict their outcomes.',
  fields: [
    { name: 'browser', label: 'Browser', type: 'select', options: ['Chrome', 'Firefox', 'Edge'] },
    { name: 'os', label: 'Operating system', type: 'select', options: ['Windows', 'macOS', 'Linux'] },
    { name: 'payment', label: 'Payment', type: 'select', options: ['Card', 'Wallet', 'Bank transfer'] },
    { name: 'locale', label: 'Locale', type: 'select', options: ['en-US', 'en-GB', 'fr-CA'] },
  ],
  outcomes: [ready, blocked],
  oracle,
  partitions: [],
  targetRows: 9,
  mutants: [
    { id: 'wallet', label: 'Offers wallet on Firefox', fn: (row) => result(transferBlocked(row)) },
    { id: 'transfer', label: 'Offers bank transfer in fr-CA', fn: (row) => result(walletBlocked(row)) },
    { id: 'card', label: 'Blocks card payments on Chrome', fn: (row) => result(oracle(row) === blocked || (row.browser === 'Chrome' && row.payment === 'Card')) },
  ],
  hints: ['There are nine browser and OS pairs. Start with one row per pair.', 'Number each field’s values 0 to 2, then use the browser and OS positions to rotate the other two fields in different patterns.'],
  solutionNotes: 'Index each list from 0. For each browser index `b` and OS index `o`, use payment index `(b + o) % 3` and locale index `(b + 2 * o) % 3`. This gives nine rows and covers all 54 distinct pairs. Use the two rejection rules to predict the outcome per row.',
  interviewNotes: 'Define the coverage claim precisely: every two-field combination occurs, but some three-field combinations are absent. Add a separate targeted row if a known risk depends on three fields.',
  sources: [{ label: 'NIST: Practical combinatorial testing', url: 'https://csrc.nist.gov/pubs/sp/800/142/final' }],
};

export default item;
