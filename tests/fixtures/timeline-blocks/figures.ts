/**
 * Timeline and blocks data for the tests. `scope` and `database` are the approved mockups' placeholder
 * data (docs/design/study-diagrams/b2-timeline.html and b2-blocks.html). `states` and `pipeline` cover
 * what no mockup draws: heads that follow each other in time, a moment at the end of the scale, and the
 * arrow between boxes in one row. Nothing here is sourced, and writers source each fact before a Study
 * page uses it.
 */
export const scope = {
  id: 'scope',
  type: 'timeline',
  title: 'Scope sets how long a fixture lives',
  note: 'Each bar is one copy, from setup to teardown. Four tests run on two workers.',
  description: [
    'Four tests run on two workers, tests 1 and 2 on worker 1 and tests 3 and 4 on worker 2.',
    'A test-scoped fixture is set up four times, once for each test. A worker-scoped fixture is set up twice, once in each worker.',
  ],
  ticks: { name: 'Test', labels: ['1', '2', '3', '4'] },
  groups: [{ label: 'Worker 1', from: 0, to: 2 }, { label: 'Worker 2', from: 2, to: 4 }],
  parallel: true,
  lanes: [{
    entries: [
      { name: 'Test', detail: 'or function in pytest', spans: [{ from: 0, to: 1 }, { from: 1, to: 2 }, { from: 2, to: 3 }, { from: 3, to: 4 }] },
      { name: 'Worker', detail: 'Playwright', spans: [{ from: 0, to: 2 }, { from: 2, to: 4 }] },
      { name: 'Session', detail: 'pytest with xdist', spans: [{ from: 0, to: 2 }, { from: 2, to: 4 }] },
    ],
  }],
};

export const states = {
  id: 'states',
  type: 'timeline',
  title: 'One read against repeated reads',
  description: 'The page shows Draft, then Saving, then Saved. One read runs during Saving. The repeated reads go on until the last state.',
  steps: 12,
  groups: [{ label: 'Draft', from: 0, to: 4 }, { label: 'Saving', from: 4, to: 8 }, { label: 'Saved', from: 8, to: 12 }],
  lanes: [
    { name: 'One read', entries: [{ name: 'Read', spans: [{ from: 5, to: 6 }], outcome: 'Too early' }] },
    { name: 'Repeated reads', mark: { label: 'Match', at: 12 }, entries: [{ name: 'Reads', spans: [{ from: 5, to: 12 }], strong: true }] },
  ],
};

export const database = {
  id: 'database',
  type: 'blocks',
  title: 'Separate contexts, one shared database',
  note: 'Each test gets its own browser context. Both tests reach the same database.',
  description: [
    'Test A and Test B each have their own browser context, holding cookies and storage.',
    'Both tests save orders to one server database, which holds an order for Test A and an order for Test B.',
  ],
  tiers: [
    [
      { title: 'Test A', parts: [{ name: 'Browser context', items: ['Cookies', 'Storage'] }], linkTo: { label: 'saves to', target: 'database' } },
      { title: 'Test B', parts: [{ name: 'Browser context', items: ['Cookies', 'Storage'] }], linkTo: { label: 'saves to', target: 'database' } },
    ],
    [{ id: 'database', title: 'Server database', strong: true, parts: [{ name: 'Order for Test A' }, { name: 'Order for Test B' }] }],
  ],
};

export const pipeline = {
  id: 'pipeline',
  type: 'blocks',
  title: 'A build passes through three stages',
  description: 'Build hands over to Test, and Test hands over to Deploy. Deploy writes to the log.',
  tiers: [
    [
      { title: 'Build', linkTo: { label: 'hands over to', target: 'test' } },
      { id: 'test', title: 'Test', parts: [{ name: 'Suite', strong: true, items: ['Unit', 'API'] }], linkTo: { label: 'hands over to', target: 'deploy' } },
      { id: 'deploy', title: 'Deploy', linkTo: { label: 'writes to', target: 'log' } },
    ],
    [{ id: 'log', title: 'Log' }],
  ],
};

export const figures = [scope, states, database, pipeline];