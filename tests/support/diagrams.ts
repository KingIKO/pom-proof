/** Checks the diagram specs run in the page. Each runs in the browser, so it uses nothing from this module. */

/**
 * Parts that spill out of their figure, and boxes whose content is wider than they are. With
 * `edgeOnly`, only a part that crosses the figure's outer edge counts, so content may use the padding,
 * and what sits inside a box that scrolls by itself is left to that box.
 */
export function figureOverflow(edgeOnly: boolean) {
  const name = (element: Element) => {
    const className = element.getAttribute('class');
    return `${element.tagName.toLowerCase()}${className ? `.${className.split(' ')[0]}` : ''} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
  };
  return [...document.querySelectorAll('figure[data-diagram]')].flatMap((figure) => {
    const box = figure.getBoundingClientRect();
    const found: string[] = [];
    if (!edgeOnly && figure.scrollWidth > figure.clientWidth) found.push(`${name(figure)} scrolls ${figure.scrollWidth - figure.clientWidth}px sideways`);
    for (const part of figure.querySelectorAll('*')) {
      if (part.closest('.visually-hidden')) continue;
      if (edgeOnly && part.parentElement?.closest('.dg-scroll')) continue;
      const rect = part.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;
      if (rect.left < box.left - 0.5 || rect.right > box.right + 0.5) found.push(`${name(part)} spills out of its figure`);
      // The corner axis name of a narrow matrix reaches over the first column on purpose (spec, narrow matrix).
      if (part.matches('.dg-axis-side')) continue;
      if (!edgeOnly && part.clientWidth && part.scrollWidth > part.clientWidth + 1) found.push(`${name(part)} holds content ${part.scrollWidth - part.clientWidth}px wider than its box`);
    }
    return found;
  });
}

/** Table heads of a figure whose words overlap on screen. */
export function overlappingHeads() {
  const boxOf = (element: Element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return range.getBoundingClientRect();
  };
  return [...document.querySelectorAll('figure[data-diagram] table')].flatMap((table) => {
    const heads = [...table.querySelectorAll('th')].filter((head) => head.getBoundingClientRect().width > 0)
      .map((head) => ({ text: head.textContent!.trim(), box: boxOf(head) }));
    return heads.flatMap((a, index) => heads.slice(index + 1).filter((b) =>
      Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left) > 0
      && Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top) > 0).map((b) => `"${a.text}" overlaps "${b.text}"`));
  });
}

/** Sets the root text size to 200%, as a reader's text zoom does. */
export const doubleText = () => { document.documentElement.style.fontSize = '200%'; };

/** The text spacing a reader may set (WCAG 1.4.12). */
export const textSpacing = '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-block-end: 2em !important; }';
