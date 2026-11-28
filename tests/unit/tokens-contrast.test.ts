import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { root } from '../support/problems';

type Rgb = [number, number, number];

/**
 * The custom properties of the first `:root` block and of the Study diagram block
 * (`figure[data-diagram]`), with `var()` references and the `color-mix(in srgb, a p%, b)` form the
 * tint tokens use resolved to hex colours.
 */
function readTokens(css: string): Record<string, Rgb> {
  const block = /:root\s*\{([^}]*)\}/.exec(css)?.[1];
  if (!block) throw new Error('tokens.css has no :root block');
  const diagram = /figure\[data-diagram\]\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
  const raw = new Map(Array.from(`${block}\n${diagram}`.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g), ([, name, value]) => [name, value.trim()]));
  const resolved = new Map<string, Rgb | null>();
  const resolve = (name: string, seen: string[] = []): Rgb | null => {
    if (resolved.has(name)) return resolved.get(name)!;
    if (seen.includes(name)) throw new Error(`token cycle: ${[...seen, name].join(' -> ')}`);
    const value = raw.get(name);
    const result = value === undefined ? null : parse(value, [...seen, name]);
    resolved.set(name, result);
    return result;
  };
  const parse = (value: string, seen: string[]): Rgb | null => {
    const hex = /^#([0-9a-f]{6})$/i.exec(value);
    if (hex) return [0, 2, 4].map((at) => parseInt(hex[1].slice(at, at + 2), 16)) as Rgb;
    const ref = /^var\(--([\w-]+)\)$/.exec(value);
    if (ref) return resolve(ref[1], seen);
    const mix = /^color-mix\(in srgb,\s*(.+?)\s+([\d.]+)%,\s*(.+)\)$/.exec(value);
    if (mix) {
      const [a, b] = [parse(mix[1], seen), parse(mix[3], seen)];
      const share = Number(mix[2]) / 100;
      return a && b ? a.map((channel, index) => channel * share + b[index] * (1 - share)) as Rgb : null;
    }
    return null;
  };
  const tokens: Record<string, Rgb> = {};
  for (const name of raw.keys()) {
    const colour = resolve(name);
    if (colour) tokens[name] = colour;
  }
  return tokens;
}

/** WCAG 2.2 contrast ratio of two sRGB colours. */
function contrast(a: Rgb, b: Rgb): number {
  const luminance = (rgb: Rgb) => {
    const [r, g, b] = rgb.map((channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const white = 'white';
const text = 4.5;
const nonText = 3;

/**
 * Palette A pairs from the redesign plan (section 4). Text pairs need 4.5:1; control borders and the
 * focus ring need 3:1 against the surfaces they sit on. The header pairs (muted nav text and the amber
 * ring on ink) are the only places those tokens appear.
 */
const pairs: Array<{ fg: string; bg: string; min: number }> = [
  ...['text', 'text2', 'text3', 'link'].flatMap((fg) => ['surface', 'surfaceHover'].map((bg) => ({ fg, bg, min: text }))),
  { fg: white, bg: 'primary', min: text },
  { fg: white, bg: 'primaryHover', min: text },
  ...['easy', 'medium', 'hard'].flatMap((fg) => ['surface', 'surfaceHover'].map((bg) => ({ fg, bg, min: text }))),
  { fg: 'badgeText', bg: 'badgeBg', min: text },
  ...['borderControl', 'focus'].flatMap((fg) => ['surface', 'surfaceHover', 'canvas'].map((bg) => ({ fg, bg, min: nonText }))),
  ...['pass', 'fail', 'warn'].map((fg) => ({ fg, bg: white, min: text })),
  // The result panel writes its mark in the result colour on the matching tint.
  { fg: 'pass', bg: 'passTint', min: text },
  { fg: 'fail', bg: 'failTint', min: text },
  { fg: 'warn', bg: 'warnTint', min: text },
  { fg: 'onInkMuted', bg: 'ink', min: text },
  { fg: 'accent', bg: 'ink', min: nonText },
  // Study diagrams (diagram spec, Contrast): labels in ink on every part fill, part items and other
  // secondary text on the part and level fills, the accept and reject words on their bands, a white
  // numeral on a filled marker, and the lines and markers that carry meaning against the card.
  ...['dg-part', 'dg-part-strong', 'dg-low', 'dg-medium', 'dg-high'].map((bg) => ({ fg: 'text', bg, min: text })),
  ...['dg-part', 'dg-low', 'dg-medium', 'dg-high'].map((bg) => ({ fg: 'text2', bg, min: text })),
  { fg: 'dg-accept-text', bg: 'dg-accept-bg', min: text },
  { fg: 'dg-reject-text', bg: 'dg-reject-bg', min: text },
  { fg: white, bg: 'dg-mark', min: text },
  ...['dg-part-edge', 'dg-edge', 'dg-mark'].map((fg) => ({ fg, bg: 'surface', min: nonText })),
  // Blocks: the items of a strong part. Timeline: a moment's line where it crosses or meets a bar.
  { fg: 'text2', bg: 'dg-part-strong', min: text },
  ...['dg-part', 'dg-part-strong'].map((bg) => ({ fg: 'dg-edge', bg, min: nonText })),
];

/** Every pair below its minimum, or naming a token the stylesheet does not define. */
function contrastFailures(css: string) {
  const tokens = readTokens(css);
  const colour = (name: string): Rgb | undefined => (name === white ? [255, 255, 255] : tokens[name]);
  return pairs.flatMap(({ fg, bg, min }) => {
    const [a, b] = [colour(fg), colour(bg)];
    if (!a || !b) return [`${fg} on ${bg}: token missing`];
    const ratio = contrast(a, b);
    return ratio + 1e-9 < min ? [`${fg} on ${bg}: ${ratio.toFixed(2)}:1, needs ${min}:1`] : [];
  });
}

const tokensCss = readFileSync(join(root, 'src', 'styles', 'tokens.css'), 'utf8');

describe('palette A contrast', () => {
  test('the contrast maths matches known WCAG values', () => {
    expect(contrast([0, 0, 0], [255, 255, 255])).toBeCloseTo(21, 5);
    expect(contrast([118, 118, 118], [255, 255, 255])).toBeCloseTo(4.54, 2);
  });

  test('tokens.css defines every colour the pairs name', () => {
    const tokens = readTokens(tokensCss);
    const names = new Set(pairs.flatMap(({ fg, bg }) => [fg, bg]).filter((name) => name !== white));
    expect([...names].filter((name) => !tokens[name])).toEqual([]);
  });

  test('every palette A pair meets AA', () => {
    expect(contrastFailures(tokensCss)).toEqual([]);
  });

  test.each([
    ['text3', '#9AA2B8', 'text3 on surface'],
    ['borderControl', '#C2C8DA', 'borderControl on surface'],
    ['focus', '#AEB8D4', 'focus on canvas'],
    ['warn', '#D97706', 'warn on white'],
    ['primary', '#5B8DEF', 'white on primary'],
  ])('a weakened %s (%s) is reported', (token, value, pair) => {
    const planted = tokensCss.replace(new RegExp(`(--${token}\\s*:\\s*)[^;]+;`), `$1${value};`);
    expect(planted, `${token} was replaced`).not.toBe(tokensCss);
    expect(contrastFailures(planted).some((failure) => failure.startsWith(`${pair}:`)), pair).toBe(true);
  });

  test.each([
    ['dg-part-edge', 'color-mix(in srgb, var(--primary) 40%, var(--surface))', 'dg-part-edge on surface'],
    ['dg-medium', 'var(--accent)', 'text2 on dg-medium'],
    ['dg-part', 'var(--text3)', 'text2 on dg-part'],
    ['dg-part-strong', 'color-mix(in srgb, var(--primary) 45%, var(--surface))', 'text2 on dg-part-strong'],
    ['dg-part-strong', 'var(--primary)', 'dg-edge on dg-part-strong'],
    ['dg-edge', 'var(--dg-part-edge)', 'dg-edge on dg-part'],
  ])('a weakened diagram token %s (%s) is reported', (token, value, pair) => {
    const planted = tokensCss.replace(new RegExp(`(--${token}\\s*:\\s*)[^;]+;`), `$1${value};`);
    expect(planted, `${token} was replaced`).not.toBe(tokensCss);
    expect(contrastFailures(tokensCss).some((failure) => failure.startsWith(`${pair}:`)), `${pair} before the plant`).toBe(false);
    expect(contrastFailures(planted).some((failure) => failure.startsWith(`${pair}:`)), pair).toBe(true);
  });

  test('the diagram tokens resolve to the values the spec measured', () => {
    const tokens = readTokens(tokensCss);
    const hex = (name: string) => `#${tokens[name].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    expect(Object.fromEntries(['dg-part', 'dg-part-strong', 'dg-part-edge', 'dg-low', 'dg-medium', 'dg-high', 'dg-edge', 'dg-mark']
      .map((name) => [name, hex(name)]))).toEqual({
      'dg-part': '#EAF0FF', 'dg-part-strong': '#DBE3F9', 'dg-part-edge': '#6A8BE5', 'dg-low': '#F5F7FC',
      'dg-medium': '#FFEACB', 'dg-high': '#F7E0E6', 'dg-edge': '#55607A', 'dg-mark': '#101A33',
    });
  });

  // The number line and matrix tokens: band words, filled and hollow markers, and the level fills.
  test.each([
    ['dg-accept-bg', 'color-mix(in srgb, var(--pass) 30%, var(--surface))', 'dg-accept-text on dg-accept-bg'],
    ['dg-accept-text', '#2E9E94', 'dg-accept-text on dg-accept-bg'],
    ['dg-reject-bg', 'color-mix(in srgb, var(--fail) 30%, var(--surface))', 'dg-reject-text on dg-reject-bg'],
    ['dg-reject-text', '#E0627F', 'dg-reject-text on dg-reject-bg'],
    ['dg-mark', '#8A93AA', 'white on dg-mark'],
    ['dg-mark', '#AEB8D4', 'dg-mark on surface'],
    ['dg-edge', '#AEB8D4', 'dg-edge on surface'],
    ['dg-low', 'var(--disabled)', 'text2 on dg-low'],
    ['dg-high', 'color-mix(in srgb, var(--fail) 35%, var(--surface))', 'text2 on dg-high'],
    ['dg-high', 'var(--fail)', 'text on dg-high'],
  ])('a weakened number line or matrix token %s (%s) is reported', (token, value, pair) => {
    const planted = tokensCss.replace(new RegExp(`(--${token}\\s*:\\s*)[^;]+;`), `$1${value};`);
    expect(planted, `${token} was replaced`).not.toBe(tokensCss);
    expect(contrastFailures(tokensCss).some((failure) => failure.startsWith(`${pair}:`)), `${pair} before the plant`).toBe(false);
    expect(contrastFailures(planted).some((failure) => failure.startsWith(`${pair}:`)), pair).toBe(true);
  });

  test('the accept and reject tokens resolve to the values the spec measured', () => {
    const tokens = readTokens(tokensCss);
    const hex = (name: string) => `#${tokens[name].map((channel) => Math.round(channel).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
    expect(Object.fromEntries(['dg-accept-bg', 'dg-accept-text', 'dg-reject-bg', 'dg-reject-text'].map((name) => [name, hex(name)])))
      .toEqual({ 'dg-accept-bg': '#ECF4F3', 'dg-accept-text': '#0F766E', 'dg-reject-bg': '#FAECEF', 'dg-reject-text': '#BE123C' });
  });

  test('a token removed from the stylesheet is reported, not skipped', () => {
    const planted = tokensCss.replace(/--badgeText\s*:[^;]+;/, '');
    expect(contrastFailures(planted)).toContain('badgeText on badgeBg: token missing');
  });
});
