import { z } from 'astro/zod';

export const idSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const textSchema = z.string().trim().min(1);
const source = z.string().refine((value) => value.trim().length > 0, 'Provide source text');
export const roleSchema = z.enum(['manual-qa', 'automation', 'sdet', 'senior']);
const exportName = z.string().regex(/^[A-Za-z_][A-Za-z_0-9]*$/);
const language = z.enum(['js', 'ts', 'python']);

const option = z.strictObject({ id: idSchema, text: textSchema });
const item = { id: idSchema, prompt: textSchema };
const choices = z.array(option).min(2);
const structuredItem = z.discriminatedUnion('type', [
  z.strictObject({ ...item, type: z.literal('single-choice'), choices }),
  z.strictObject({ ...item, type: z.literal('multi-select'), choices }),
  z.strictObject({ ...item, type: z.literal('ordering'), choices }),
  z.strictObject({
    ...item,
    type: z.literal('budgeted-pick'),
    budget: z.number().int().positive(),
    choices: z.array(option.extend({ cost: z.number().int().positive() })).min(2),
  }),
  z.strictObject({ ...item, type: z.literal('line-marking'), lines: z.array(option.extend({ text: source })).min(2) }),
]);

const structuredAnswer = z.record(idSchema, z.union([idSchema, z.array(idSchema)]));
const locatorAnswer = z.discriminatedUnion('by', [
  z.strictObject({ by: z.literal('role'), role: idSchema, name: textSchema, exact: z.boolean() }),
  z.strictObject({ by: z.literal('text'), text: textSchema, exact: z.boolean() }),
  z.strictObject({ by: z.literal('label'), text: textSchema, exact: z.boolean() }),
  z.strictObject({ by: z.literal('test-id'), testId: textSchema }),
  z.strictObject({ by: z.literal('css'), selector: textSchema }),
  z.strictObject({ by: z.literal('xpath'), selector: textSchema }),
  z.strictObject({ by: z.literal('expression'), source }),
]);
const sourceAnswer = z.strictObject({ source });
const param = { name: exportName, label: textSchema };
const mutationParam = z.discriminatedUnion('type', [
  z.strictObject({ ...param, type: z.literal('number') }),
  z.strictObject({ ...param, type: z.literal('string') }),
  z.strictObject({ ...param, type: z.literal('boolean') }),
  z.strictObject({
    ...param,
    type: z.literal('enum'),
    values: z.array(textSchema).min(1).refine((values) => new Set(values).size === values.length, 'List distinct values'),
  }),
]);
const rowsAnswer = z.strictObject({
  rows: z.array(z.strictObject({ args: z.array(z.json()), expected: z.json() })).min(1),
});
const mutationAnswer = z.union([sourceAnswer, rowsAnswer]);
const sqlAnswer = z.strictObject({ query: source });
const codeAnswer = sourceAnswer.extend({ language });

const common = {
  title: textSchema,
  topic: idSchema,
  difficulty: z.enum(['easy', 'medium', 'hard']),
  minutes: z.number().int().positive(),
  roles: z.array(roleSchema).min(1),
};
const structured = {
  ...common,
  items: z.array(structuredItem).min(1),
  reference: structuredAnswer,
  decoy: structuredAnswer,
};

const problem = z.discriminatedUnion('kind', [
  z.strictObject({ ...structured, kind: z.literal('scenario') }),
  z.strictObject({ ...structured, kind: z.literal('diagnosis') }),
  z.strictObject({ ...structured, kind: z.literal('bug-report') }),
  z.strictObject({
    ...common,
    kind: z.literal('test-design'),
    exportName,
    implementation: source,
    mutants: z.array(z.strictObject({ name: idSchema, implementation: source, teaches: textSchema })).min(1),
    params: z.array(mutationParam).optional(),
    reference: mutationAnswer,
    rowsReference: rowsAnswer.optional(),
    decoy: mutationAnswer,
  }),
  z.strictObject({
    ...common,
    kind: z.literal('locator'),
    fixture: source,
    target: textSchema,
    variants: z.array(z.strictObject({ name: idSchema, fixture: source })).min(1),
    reference: locatorAnswer,
    decoy: locatorAnswer,
  }),
  z.strictObject({
    ...common,
    kind: z.literal('sql'),
    schema: source,
    seed: source,
    alteredSeed: source,
    reference: sqlAnswer,
    decoy: sqlAnswer,
  }),
  z.strictObject({
    ...common,
    kind: z.literal('code'),
    exportName,
    allowInputMutation: z.boolean().optional(),
    starters: z.strictObject({ js: source, ts: source, python: source }),
    solutions: z.strictObject({ js: source, ts: source, python: source }).optional(),
    vectors: z.array(z.strictObject({ name: idSchema, args: z.array(z.json()), expected: z.json() })).min(1),
    reference: codeAnswer,
    decoy: codeAnswer,
  }),
]);

const unique = (values: readonly string[]) => new Set(values).size === values.length;

export const problemSchema = problem.superRefine((data, ctx) => {
  const issue = (path: Array<string | number>, message: string) =>
    ctx.addIssue({ code: 'custom', path, message });
  if (!unique(data.roles)) issue(['roles'], 'List each role once');

  switch (data.kind) {
    case 'scenario':
    case 'diagnosis':
    case 'bug-report': {
      if (!unique(data.items.map(({ id }) => id))) issue(['items'], 'Item ids must be unique');
      let answersDiffer = false;
      data.items.forEach((row, index) => {
        const options = row.type === 'line-marking' ? row.lines : row.choices;
        const ids = options.map(({ id }) => id);
        if (!unique(ids)) issue(['items', index], 'Option ids must be unique within an item');
        for (const key of ['reference', 'decoy'] as const) {
          const answer = data[key][row.id];
          const path = [key, row.id];
          if (row.type === 'single-choice') {
            if (typeof answer !== 'string' || !ids.includes(answer)) issue(path, 'Select one known option id');
            continue;
          }
          if (!Array.isArray(answer) || !unique(answer) || !answer.every((id) => ids.includes(id))) {
            issue(path, 'List distinct known option ids');
            continue;
          }
          if (row.type === 'ordering' && answer.length !== ids.length) issue(path, 'Order every option');
          if (row.type === 'budgeted-pick') {
            const spent = row.choices.reduce((total, pick) => total + (answer.includes(pick.id) ? pick.cost : 0), 0);
            if (spent > row.budget || answer.length === 0) issue(path, 'Pick options within the budget');
          }
        }
        const canonical = (answer: string | string[] | undefined) =>
          Array.isArray(answer) && row.type !== 'ordering' ? [...answer].sort() : answer;
        if (JSON.stringify(canonical(data.reference[row.id])) !== JSON.stringify(canonical(data.decoy[row.id]))) {
          answersDiffer = true;
        }
      });
      const itemIds = new Set(data.items.map(({ id }) => id));
      for (const key of ['reference', 'decoy'] as const) {
        for (const id of Object.keys(data[key])) {
          if (!itemIds.has(id)) issue([key, id], 'Answer names an unknown item');
        }
      }
      if (!answersDiffer) issue(['decoy'], 'The decoy must differ from the reference');
      break;
    }
    default:
      if (JSON.stringify(data.reference) === JSON.stringify(data.decoy)) {
        issue(['decoy'], 'The decoy must differ from the reference');
      }
  }

  if (data.kind === 'test-design') {
    const { params, rowsReference } = data;
    if (!unique(data.mutants.map(({ name }) => name))) issue(['mutants'], 'Mutant names must be unique');
    if (params && !unique(params.map(({ name }) => name))) issue(['params'], 'Parameter names must be unique');
    if (rowsReference && 'rows' in data.reference) issue(['rowsReference'], 'Use only one table reference');
    for (const key of ['reference', 'rowsReference', 'decoy'] as const) {
      const answer = data[key];
      if (!answer || !('rows' in answer)) continue;
      if (!params) {
        issue([key], 'Provide params for table answers');
        continue;
      }
      answer.rows.forEach(({ args }, index) => {
        if (args.length !== params.length) issue([key, 'rows', index, 'args'], 'Provide one argument per parameter');
        params.forEach((parameter, column) => {
          const value = args[column];
          const matches = parameter.type === 'enum'
            ? typeof value === 'string' && parameter.values.includes(value)
            : typeof value === parameter.type;
          if (!matches) issue([key, 'rows', index, 'args', column], `Expected a ${parameter.type} value`);
        });
      });
    }
  }
  if (data.kind === 'locator' && !unique(data.variants.map(({ name }) => name))) {
    issue(['variants'], 'Variant names must be unique');
  }
  if (data.kind === 'sql' && data.alteredSeed.trim() === data.seed.trim()) {
    issue(['alteredSeed'], 'Provide a different seed to check query generalization');
  }
  if (data.kind === 'code' && !unique(data.vectors.map(({ name }) => name))) {
    issue(['vectors'], 'Vector names must be unique');
  }
});

export type ProblemData = z.infer<typeof problemSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Json = z.infer<ReturnType<typeof z.json>>;
