import type { DesignRow, TestDesignItem } from '../../types';

const regular = 'Up to 2 kg';
const heavy = 'Over 2 kg';
const bands = [regular, heavy];
const dollars = (amount: number) => `$${amount}`;
const oracle = ({ band, member, express }: DesignRow) =>
  dollars((band === heavy ? 10 : 5) - (member ? 2 : 0) + (express ? 7 : 0));

const item: TestDesignItem = {
  id: 'shipping-decision-table',
  title: 'Build a shipping decision table',
  kind: 'testdesign',
  difficulty: 'Medium',
  technique: 'Decision table',
  topics: ['Decision table', 'Business rules'],
  roles: ['manual', 'automation', 'sdet'],
  summary: 'Cover each shipping rule and catch defects where membership, weight and speed interact.',
  prompt: 'Standard shipping starts at **$5 up to 2 kg** and **$10 above 2 kg**. Members get $2 off the base rate. Express shipping adds $7, including for members. The earlier checkout step has already classified the parcel into a weight band. Add a row for each rule and predict the final charge.',
  fields: [
    { name: 'band', label: 'Weight band', type: 'select', options: bands },
    { name: 'member', label: 'Member', type: 'boolean' },
    { name: 'express', label: 'Express', type: 'boolean' },
  ],
  outcomes: [3, 5, 8, 10, 12, 15, 17].map(dollars),
  oracle,
  partitions: bands.flatMap((band, bandIndex) => [false, true].flatMap((member) => [false, true].map((express) => ({
    id: `${bandIndex}-${Number(member)}-${Number(express)}`,
    label: `${band}, ${member ? 'member' : 'non-member'}, ${express ? 'express' : 'standard'}`,
    kind: 'valid',
    matches: (row: DesignRow) => row.band === band && row.member === member && row.express === express,
  } as const)))),
  mutants: [
    { id: 'heavy', label: 'Uses the light base rate for heavy parcels', fn: (row) => oracle({ ...row, band: regular }) },
    { id: 'express-member', label: 'Drops the member discount on express', fn: (row) => oracle({ ...row, member: row.member && !row.express }) },
    { id: 'light-express', label: 'Forgets the express charge on light parcels', fn: (row) => oracle({ ...row, express: row.express && row.band === heavy }) },
    { id: 'heavy-standard', label: 'Applies the member discount to heavy standard parcels for every customer', fn: (row) => oracle({ ...row, member: row.member || (row.band === heavy && !row.express) }) },
  ],
  hints: ['Each weight band can be paired with both member values and both delivery speeds.', 'Calculate one base rate, one optional discount, and one optional surcharge per row.'],
  solutionNotes: 'For light parcels, non-member standard and express cost $5 and $12; member standard and express cost $3 and $10. For heavy parcels the corresponding charges are $10, $17, $8 and $15. The two $10 outcomes still come from different rules and both need a row.',
  interviewNotes: 'Keep the decision table focused on pricing. Test the 2 kg cutoff separately at the point that classifies parcel weight.',
  sources: [{ label: 'ISTQB CTFL v4.0.1, section 4.2.3: Decision table testing', url: 'https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf' }],
};

export default item;
