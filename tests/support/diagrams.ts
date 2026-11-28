/** Checks the diagram specs run in the page. Each runs in the browser, so it uses nothing from this module. */

/**
 * Parts that cross their figure's outer edge: elements, the text inside them, and drawn bars, which
 * may be a bar's own box or its ::after. With `strict`, also a box whose content is wider than it is.
 * Without it, what sits inside a box that scrolls by itself is left to that box.
 */
export function figureOverflow(strict: boolean) {
  const name = (element: Element) => {
    const className = element.getAttribute('class');
    return `${element.tagName.toLowerCase()}${className ? `.${className.split(' ')[0]}` : ''} "${(element.textContent ?? '').trim().slice(0, 30)}"`;
  };
  return [...document.querySelectorAll('figure[data-diagram]')].flatMap((figure) => {
    const box = figure.getBoundingClientRect();
    const found: string[] = [];
    const past = (left: number, right: number) => Math.max(box.left - left, right - box.right);
    if (strict && figure.scrollWidth > figure.clientWidth) found.push(`${name(figure)} scrolls ${figure.scrollWidth - figure.clientWidth}px sideways`);
    for (const part of figure.querySelectorAll('*')) {
      if (part.closest('.visually-hidden')) continue;
      if (!strict && part.parentElement?.closest('.dg-scroll')) continue;
      const rect = part.getBoundingClientRect();
      if (!rect.width && !rect.height) continue;
      // The element's own text, which can run past a box that is narrower than a long word.
      const ink = [...part.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim()).map((node) => {
        const range = document.createRange();
        range.selectNode(node);
        const { left, right } = range.getBoundingClientRect();
        return past(left, right);
      });
      const over = Math.max(past(rect.left, rect.right), ...ink);
      if (over > 0.5) found.push(`${name(part)} passes the card edge by ${over.toFixed(1)}px`);
      // The corner axis name of a narrow matrix reaches over the first column on purpose (spec, narrow matrix).
      if (strict && !part.matches('.dg-axis-side') && part.clientWidth && part.scrollWidth > part.clientWidth + 1) found.push(`${name(part)} holds content ${part.scrollWidth - part.clientWidth}px wider than its box`);
      const after = getComputedStyle(part, '::after');
      if (after.content !== 'none' && after.content !== 'normal') {
        const width = parseFloat(after.width);
        const centre = rect.left + rect.width / 2;
        const barOver = past(centre - width / 2, centre + width / 2);
        if (barOver > 0.5) found.push(`${name(part)} draws its bar past the card edge by ${barOver.toFixed(1)}px`);
      }
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
