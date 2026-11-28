/**
 * Checks that a timeline or blocks figure is drawn where its data puts things (diagram spec, Timeline
 * and Blocks). Each function runs in the browser, so it uses nothing from this module.
 */

interface Span { from: number; to: number }

export interface TimelineData {
  id: string;
  type: string;
  steps?: number;
  ticks?: { name: string; labels: string[] };
  groups?: Array<Span & { label: string }>;
  parallel?: boolean;
  lanes: Array<{
    name?: string;
    mark?: { label: string; at: number };
    entries: Array<{ name: string; detail?: string; spans: Span[]; strong?: boolean; outcome?: string }>;
  }>;
}

interface BoxData {
  id?: string;
  title: string;
  strong?: boolean;
  parts?: Array<{ name: string; items?: string[]; strong?: boolean }>;
  linkTo?: { label: string; target: string };
}

export interface BlocksData {
  id: string;
  type: string;
  tiers?: BoxData[][];
  panels?: Array<{ name: string; tiers: BoxData[][]; result: string }>;
}

/** Problems with how a timeline is drawn: one scale for every bar, and each label where it belongs. */
export function timelineDrawing({ id, steps, ticks, groups = [], parallel, lanes }: TimelineData) {
  const found: string[] = [];
  const figure = document.querySelector(`figure[data-diagram="timeline"]:has(> #dg-${id})`);
  if (!figure) return [`no timeline ${id}`];
  const box = (element: Element) => element.getBoundingClientRect();
  const words = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect();
  };
  const colour = (token: string) => {
    const probe = document.createElement('i');
    probe.style.color = `var(--${token})`;
    figure.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  };
  const near = (a: number, b: number) => Math.abs(a - b) <= 1;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);

  const laneElements = [...figure.querySelectorAll('.dg-lane')];
  const rows = lanes.flatMap((lane, index) => {
    const items = [...laneElements[index]?.querySelectorAll('li') ?? []];
    if (items.length !== lane.entries.length) found.push(`lane ${index + 1} draws ${items.length} rows for ${lane.entries.length}`);
    return lane.entries.flatMap((entry, at) => (items[at] ? [{ ...entry, lane: index, element: items[at], bars: [...items[at].querySelectorAll('.dg-span')] }] : []));
  });
  const all = rows.flatMap(({ name, spans, bars }) => {
    if (bars.length !== spans.length) found.push(`"${name}" draws ${bars.length} bars for ${spans.length}`);
    return bars.map((bar, index) => ({ name, bar, span: spans[index] }));
  });

  // One scale: the longest bar sets a column's width and the start, and every other edge must agree.
  const columns = ticks?.labels.length ?? steps ?? 0;
  const gaps = parallel ? groups.slice(0, -1).map(({ to }) => to) : [];
  const gapsBefore = (at: number, edge: 'start' | 'end') => gaps.filter((gap) => gap < at || (gap === at && edge === 'start')).length * rem;
  const length = ({ from, to }: Span) => to - from;
  const longest = all.reduce((best, next) => (length(next.span) > length(best.span) ? next : best));
  const edges = (bar: Element) => ({ left: box(bar).left - 2, right: box(bar).right + 2 });
  const { from, to } = longest.span;
  const unit = (edges(longest.bar).right - edges(longest.bar).left - gapsBefore(to, 'end') + gapsBefore(from, 'start')) / (to - from);
  const origin = edges(longest.bar).left - from * unit - gapsBefore(from, 'start');
  const x = (at: number, edge: 'start' | 'end') => origin + at * unit + gapsBefore(at, edge);
  for (const { name, bar, span } of all) {
    if (!near(edges(bar).left, x(span.from, 'start'))) found.push(`a bar of "${name}" starts ${Math.round(edges(bar).left - x(span.from, 'start'))}px off the scale`);
    if (!near(edges(bar).right, x(span.to, 'end'))) found.push(`a bar of "${name}" ends ${Math.round(edges(bar).right - x(span.to, 'end'))}px off the scale`);
    if (box(bar).height < 2 * rem - 0.5) found.push(`a bar of "${name}" is ${Math.round(box(bar).height)}px tall`);
    if ([...bar.childNodes].some((node) => !(node instanceof Element && node.matches('.visually-hidden')))) found.push(`a bar of "${name}" has text inside`);
  }
  const card = getComputedStyle(figure);
  const content = { left: box(figure).left + parseFloat(card.paddingLeft), right: box(figure).right - parseFloat(card.paddingRight) };
  if (x(columns, 'end') > content.right + 1) found.push('the scale runs past the card padding');

  // Stacked is the layout for enlarged text on a phone: a name above its bars, an outcome below.
  const [first] = rows;
  const stacked = box(first.element.querySelector('.dg-row-name')!).bottom <= box(first.bars[0]).top + 1;
  if (!stacked && !near(x(0, 'start'), content.left + box(first.element.querySelector('.dg-row-name')!).width)) found.push('the scale does not start beside the names');
  for (const { name, strong, outcome, element, bars, spans, lane } of rows) {
    const nameElement = element.querySelector('.dg-row-name')!;
    const bar = box(bars[0]);
    if (stacked ? words(nameElement).bottom > bar.top + 1 : words(nameElement).right > x(0, 'start')) found.push(`"${name}" runs into its bars`);
    if (Number(getComputedStyle(nameElement.firstElementChild!).fontWeight) >= 700 !== Boolean(strong)) found.push(`"${name}" has the wrong weight`);
    const fill = colour(strong ? 'dg-part-strong' : 'dg-part');
    if (bars.some((each) => getComputedStyle(each).backgroundColor !== fill)) found.push(`"${name}" has the wrong fill`);
    const after = element.querySelector('.dg-outcome');
    if (Boolean(after) !== Boolean(outcome)) found.push(`"${name}" ${after ? 'has an outcome it should not' : 'has no outcome'}`);
    if (after) {
      const [text, last] = [words(after.lastElementChild!), box(bars.at(-1)!)];
      if (stacked ? text.top < last.bottom - 1 : text.left < last.right || text.top > last.bottom || text.bottom < last.top) found.push(`"${outcome}" is not right after its bar`);
      const at = lanes[lane].mark?.at;
      if (!stacked && at !== undefined && at >= spans.at(-1)!.to && text.right > x(at, 'end') - 3) found.push(`"${outcome}" runs into the moment`);
    }
  }

  // A moment is a 2px line through every row of its lane, with its label above on the roomier side.
  lanes.forEach(({ mark }, index) => {
    const element = laneElements[index];
    const line = element?.querySelector('.dg-moment-line');
    const label = element?.querySelector('.dg-moment');
    if (!mark) {
      if (line || label) found.push(`lane ${index + 1} draws a moment it does not have`);
      return;
    }
    if (!line || !label) {
      found.push(`"${mark.label}" is not drawn`);
      return;
    }
    const [rect, text] = [box(line), words(label)];
    const laneRows = [...element.querySelectorAll('li')].map(box);
    if (!near((rect.left + rect.right) / 2, x(mark.at, 'end'))) found.push(`"${mark.label}" stands ${Math.round((rect.left + rect.right) / 2 - x(mark.at, 'end'))}px off its place`);
    if (rect.width !== 2 || getComputedStyle(line).borderLeftColor !== colour('dg-edge')) found.push(`"${mark.label}" is not a 2px line`);
    if (rect.top > laneRows[0].top || rect.bottom < laneRows.at(-1)!.bottom - 0.5) found.push(`"${mark.label}" does not run through its rows`);
    if (text.bottom > laneRows[0].top + 1 || text.top < rect.top - 1) found.push(`the label "${mark.label}" is not at the top of its line`);
    if (mark.at > columns / 2 ? text.right > rect.left : text.left < rect.right) found.push(`the label "${mark.label}" is on the wrong side of its line`);
  });

  // Heads stand over their columns. Stacked, each group head starts where its group does.
  const heads = [...figure.querySelectorAll('.dg-time-head')];
  const [groupHeads, tickHeads] = [heads.filter((head) => head.matches('.dg-time-group')), heads.filter((head) => !head.matches('.dg-time-group'))];
  if (groupHeads.length !== groups.length || tickHeads.length !== (ticks?.labels.length ?? 0)) found.push('a head is missing');
  groupHeads.forEach((head, index) => {
    const { label, from: start, to: end } = groups[index];
    const text = words(head);
    if (stacked ? !near(text.left, x(start, 'start')) : !near((text.left + text.right) / 2, (x(start, 'start') + x(end, 'end')) / 2)) found.push(`"${label}" is not over its columns`);
  });
  tickHeads.forEach((head, index) => {
    const text = words(head);
    if (!near((text.left + text.right) / 2, (x(index, 'start') + x(index + 1, 'end')) / 2)) found.push(`tick ${index + 1} is not over its column`);
  });
  heads.forEach((head, index) => heads.slice(index + 1).forEach((other) => {
    const [a, b] = [words(head), words(other)];
    if (Math.min(a.right, b.right) > Math.max(a.left, b.left) + 1 && Math.min(a.bottom, b.bottom) > Math.max(a.top, b.top) + 1) {
      found.push(`"${head.textContent}" overlaps "${other.textContent}"`);
    }
  }));
  if (Boolean(figure.querySelector('.dg-time-axis')) === Boolean(ticks)) found.push('the time axis name is drawn only on a time scale');
  return found;
}

/** Problems with how blocks are drawn: equal boxes per row, parts inside, an arrow for every link. */
export function blocksDrawing({ id, tiers, panels }: BlocksData) {
  const found: string[] = [];
  const figure = document.querySelector(`figure[data-diagram="blocks"]:has(> #dg-${id})`);
  if (!figure) return [`no blocks ${id}`];
  const box = (element: Element) => element.getBoundingClientRect();
  const colour = (token: string) => {
    const probe = document.createElement('i');
    probe.style.color = `var(--${token})`;
    figure.append(probe);
    const value = getComputedStyle(probe).color;
    probe.remove();
    return value;
  };
  const words = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect();
  };
  const near = (a: number, b: number) => Math.abs(a - b) <= 1;
  const middle = ({ left, right }: DOMRect) => (left + right) / 2;
  const isBold = (element: Element) => Number(getComputedStyle(element).fontWeight) >= 700;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const card = getComputedStyle(figure);
  const wide = box(figure).width - parseFloat(card.paddingLeft) - parseFloat(card.paddingRight) >= 34 * rem;

  const roots = [...figure.querySelectorAll('.dg-blocks')];
  const drawings = tiers ? [tiers] : panels?.map((panel) => panel.tiers) ?? [];
  if (roots.length !== drawings.length) found.push(`${roots.length} drawings for ${drawings.length}`);
  drawings.forEach((drawing, index) => {
    const root = roots[index];
    if (!root) return;
    const rows = [...root.querySelectorAll(':scope > .dg-tier')].map((row) => [...row.querySelectorAll(':scope > .dg-box')]);
    if (rows.map((row) => row.length).join() !== drawing.map((row) => row.length).join()) {
      found.push('a box is missing');
      return;
    }
    const arrows = [...root.querySelectorAll('.dg-arrow-across, .dg-arrows-down > span')].filter((arrow) => arrow.textContent!.trim());
    const links = drawing.flat().filter(({ linkTo }) => linkTo).length;
    if (arrows.length !== links) found.push(`${arrows.length} arrows for ${links} links`);
    if (arrows.some((arrow) => !arrow.closest('[aria-hidden="true"]'))) found.push('an arrow is read aloud');
    const free = new Set(arrows);

    drawing.forEach((row, tier) => {
      const elements = rows[tier];
      const rects = elements.map(box);
      const stacked = rects.length > 1 && rects[1].top >= rects[0].bottom;
      const gap = (stacked || !wide ? 0.5 : 1) * rem;
      if (!near(rects[0].left, box(root).left) || !near(rects.at(-1)!.right, box(root).right)) found.push(`row ${tier + 1} does not span the drawing`);
      rects.slice(1).forEach((rect, at) => {
        const before = rects[at];
        if (stacked ? rect.top - before.bottom < gap - 1 : rect.left - before.right < gap - 1) found.push(`"${row[at + 1].title}" is too close to "${row[at].title}"`);
        if (!near(rect.width, before.width) || !stacked && (!near(rect.top, before.top) || !near(rect.bottom, before.bottom))) found.push(`row ${tier + 1} has uneven boxes`);
      });
      row.forEach(({ title, strong, parts = [], linkTo }, column) => {
        const [element, rect] = [elements[column], rects[column]];
        const target = drawing.flat().find((each) => each.id === linkTo?.target);
        const heading = element.querySelector('.dg-box-title')!;
        const said = `${title}${linkTo ? `, ${linkTo.label} ${target?.title ?? 'nothing'}` : ''}`;
        if (heading.textContent!.trim() !== said) found.push(`"${title}" reads as "${heading.textContent!.trim()}"`);
        if (isBold(heading) !== Boolean(strong)) found.push(`"${title}" has the wrong weight`);
        if (getComputedStyle(element).backgroundColor !== colour(strong ? 'dg-part-strong' : 'surface')) found.push(`"${title}" has the wrong fill`);
        const inner = [...element.querySelectorAll('.dg-part')];
        if (inner.length !== parts.length) found.push(`"${title}" draws ${inner.length} parts for ${parts.length}`);
        inner.forEach((part, at) => {
          const partRect = box(part);
          if (partRect.left < rect.left + 1 || partRect.right > rect.right - 1 || partRect.top < box(heading).bottom || partRect.bottom > rect.bottom - 1) found.push(`"${parts[at].name}" is not inside "${title}"`);
          const fill = strong ? 'surface' : parts[at].strong ? 'dg-part-strong' : 'dg-part';
          if (getComputedStyle(part).backgroundColor !== colour(fill) || isBold(part.firstElementChild!) !== Boolean(parts[at].strong)) found.push(`"${parts[at].name}" in "${title}" has the wrong emphasis`);
        });
        if (!linkTo) return;
        // An arrow stands between its two boxes: beside its own box, or under the row for a link down.
        const across = row[column + 1]?.id === linkTo.target;
        const end = across ? elements[column + 1] : rows[tier + 1]?.[0];
        const bottom = Math.max(...rects.map((each) => each.bottom));
        const own = end && [...free].find((arrow) => {
          const to = box(end);
          const at = words(arrow);
          if (across && !stacked) return at.left >= rect.right - 1 && at.right <= to.left + 1 && at.top >= rect.top && at.bottom <= rect.bottom;
          return at.top >= (across ? rect.bottom : bottom) - 1 && at.bottom <= to.top + 1 && (stacked || across || near(middle(at), middle(rect)));
        });
        if (!own) found.push(`no arrow runs from "${title}" to "${target?.title ?? linkTo.target}"`);
        else {
          free.delete(own);
          if (own.textContent!.trim() !== (across ? '→' : '↓')) found.push(`the arrow from "${title}" points the wrong way`);
        }
      });
    });
  });

  const results = [...figure.querySelectorAll('.dg-result')];
  if (results.map((result) => result.textContent).join() !== (panels ?? []).map(({ result }) => result).join()) found.push('a result line is missing');
  if (panels) {
    const [before, after] = [...figure.querySelectorAll('.dg-panel')].map(box);
    if (wide) {
      if (!near(after.left - before.right, 2 * rem)) found.push('the panels are not side by side');
      if (!near(box(results[0]).top, box(results[1]).top)) found.push('the result lines are not level');
    } else if (after.top < before.bottom) found.push('the panels are not stacked, before first');
    if (results.some((result) => !isBold(result))) found.push('a result line is not bold');
  }
  return found;
}