import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { root } from '../support/problems';

type Rgb = [number, number, number];

/**
 * The custom properties of the first `:root` block, with `var()` references and the
 * `color-mix(in srgb, a p%, b)` form the tint tokens use resolved to hex colours.
 */
function readTokens(css: string): Record<string, Rgb> {
  const block = /:root\s*\{([^}]*)\}/.exec(css)?.[1];
  if (!block) throw new Error('tokens.css has no :root block');
  const raw = new Map(Array.from(block.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g), ([, name, value]) => [name, value.trim()]));
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

  test('a token removed from the stylesheet is reported, not skipped', () => {
    const planted = tokensCss.replace(/--badgeText\s*:[^;]+;/, '');
    expect(contrastFailures(planted)).toContain('badgeText on badgeBg: token missing');
  });
});
