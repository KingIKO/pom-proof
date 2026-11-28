/**
 * Data for the matrix kind in the shape of the approved mockups (docs/design/study-diagrams/option-b2.html
 * and b2-yes-no-matrix.html). The test double answers follow Meszaros's table and Fowler (TestDouble). ISTQB
 * publishes no risk mapping, so the levels and ratings are examples. A writer gives the sources when a
 * Study page uses either one.
 */
export const risk = {
  id: 'risk',
  type: 'matrix',
  kind: 'levels',
  title: 'Likelihood and impact set the risk level',
  note: 'An example mapping and example ratings. Each team sets its own.',
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
  note: 'Can means it may do this, which Meszaros calls optional. Fowler counts a spy as a stub, so his answer there is Yes.',
  columns: ['Returns prepared answers', 'Keeps calls for the test', 'Checks expected calls', 'Works in a simpler way'],
  entries: [
    { head: 'Dummy', cells: ['No', 'No', 'No', 'No'] },
    { head: 'Stub', cells: ['Yes', 'No', 'No', 'No'] },
    { head: 'Spy', cells: ['Can', 'Yes', 'No', 'No'] },
    { head: 'Mock', cells: ['Can', 'No', 'Yes', 'No'] },
    { head: 'Fake', cells: ['No', 'No', 'No', 'Yes'] },
  ],
};

export const matrices = [risk, doubles];
