/**
 * The approved mockups' placeholder data for the matrix kind (docs/design/study-diagrams/option-b2.html
 * and b2-yes-no-matrix.html). Nothing here is sourced. Writers source each fact before a Study page
 * uses it.
 */
export const risk = {
  id: 'risk',
  type: 'matrix',
  kind: 'levels',
  title: 'Likelihood and impact set the risk level',
  note: 'The two checkout risks, with example ratings. Test the high cells first.',
  columnAxis: 'Impact',
  rowAxis: 'Likelihood',
  columns: ['Low', 'Medium', 'High'],
  entries: [
    { head: 'High', cells: ['Medium', 'High', 'High'] },
    { head: 'Medium', cells: ['Low', 'Medium', 'High'] },
    { head: 'Low', cells: ['Low', 'Low', 'Medium'] },
  ],
  placed: [
    { label: 'Receipt layout', row: 'Medium', column: 'Low' },
    { label: 'Double charge', row: 'Medium', column: 'High' },
  ],
};

export const doubles = {
  id: 'doubles',
  type: 'matrix',
  kind: 'answers',
  title: 'What each test double does',
  note: 'Can means it may do this, but that is not what defines it.',
  columns: ['Returns prepared answers', 'Stores calls', 'Checks expected calls', 'Works like the real thing'],
  entries: [
    { head: 'Dummy', cells: ['No', 'No', 'No', 'No'] },
    { head: 'Stub', cells: ['Yes', 'No', 'No', 'No'] },
    { head: 'Spy', cells: ['Can', 'Yes', 'No', 'No'] },
    { head: 'Mock', cells: ['Can', 'Yes', 'Yes', 'No'] },
    { head: 'Fake', cells: ['No', 'No', 'No', 'Yes'] },
  ],
};

export const matrices = [risk, doubles];
