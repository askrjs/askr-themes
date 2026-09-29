import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { DEFAULT_THEME_TOKENS_FILE, THEMES_DIR } from "./test-paths";

type Rgb = [number, number, number];

const tokensCss = readFileSync(DEFAULT_THEME_TOKENS_FILE, "utf-8").replace(/\/\*[\s\S]*?\*\//g, "");
const calicoCss = readFileSync(join(THEMES_DIR, "presets", "calico.css"), "utf-8");

/** Every `--ak-*` declaration in the file, last one wins (the dark source values live in `:root`). */
function allDeclarations(css: string): Map<string, string> {
  const values = new Map<string, string>();
  for (const [, name, value] of css.matchAll(/(--ak-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    values.set(name!, value!.trim());
  }
  return values;
}

/** `--ak-color-*` declarations from the blocks whose selector list includes `selector`. */
function blockDeclarations(css: string, selector: RegExp): Map<string, string> {
  const values = new Map<string, string>();
  for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!selectors!.split(",").some((part) => selector.test(part.trim()))) continue;
    for (const [, name, value] of body!.matchAll(/(--ak-color-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
      values.set(name!, value!.trim());
    }
  }
  return values;
}

function resolve(value: string, scope: Map<string, string>, seen = new Set<string>()): string {
  const ref = value.match(/^var\((--ak-[a-z0-9-]+)\)$/);
  if (!ref || seen.has(ref[1]!)) return value;
  const next = scope.get(ref[1]!);
  if (next === undefined) return value;
  seen.add(ref[1]!);
  return resolve(next, scope, seen);
}

function toLinear(channel: number): number {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function fromLinear(channel: number): number {
  const c = Math.min(1, Math.max(0, channel));
  return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
}

function oklchToRgb(l: number, c: number, hDeg: number): Rgb {
  const h = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(h);
  const b = c * Math.sin(h);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    fromLinear(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    fromLinear(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    fromLinear(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ];
}

/** Parse an opaque sRGB color; returns null for color-mix(), translucent, or unsupported syntax. */
function parseOpaque(value: string): Rgb | null {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) {
    return [0, 2, 4].map((i) => parseInt(hex[1]!.slice(i, i + 2), 16)) as Rgb;
  }
  const rgb = value.match(/^rgb\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*\)$/);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  const oklch = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/);
  if (oklch) return oklchToRgb(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]));
  return null;
}

function toOklch([r, g, b]: Rgb): { l: number; c: number; h: number } {
  const [lr, lg, lb] = [toLinear(r), toLinear(g), toLinear(b)];
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const h = (Math.atan2(B, A) * 180) / Math.PI;
  return { l: L, c: Math.hypot(A, B), h: h < 0 ? h + 360 : h };
}

function luminance([r, g, b]: Rgb): number {
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

function contrast(a: Rgb, b: Rgb): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

const declarations = allDeclarations(tokensCss);
const MODES = {
  light: blockDeclarations(tokensCss, /^\[data-theme="light"\]$/),
  dark: blockDeclarations(tokensCss, /^\[data-theme="dark"\]$/),
} as const;

function paletteFor(mode: keyof typeof MODES): Map<string, Rgb> {
  const scope = new Map([...declarations, ...MODES[mode]]);
  const palette = new Map<string, Rgb>();
  for (const [name, value] of MODES[mode]) {
    const parsed = parseOpaque(resolve(value, scope));
    if (parsed) palette.set(name, parsed);
  }
  return palette;
}

// OKLCH hue bands. Blue sits around 250-275; plum/violet/purple/magenta sit above it.
const BLUE_HUE = [245, 275] as const;
const PURPLE_HUE = [285, 345] as const;
// Below this chroma a color reads as a true grey and its hue angle is noise.
const NEUTRAL_CHROMA = 0.004;

/** [foreground, background, label]; every pair is body text and must meet WCAG AA 4.5:1. */
const TEXT_PAIRS = [
  ["--ak-color-primary", "--ak-color-bg", "primary text on bg"],
  ["--ak-color-primary", "--ak-color-surface", "primary text on surface"],
  ["--ak-color-link", "--ak-color-bg", "link on bg"],
  ["--ak-color-primary-ink", "--ak-color-primary-soft", "primary ink on primary soft"],
  ["--ak-color-text-inverse", "--ak-color-primary", "text on a filled primary button"],
] as const;

describe("default palette", () => {
  for (const mode of ["light", "dark"] as const) {
    describe(`${mode} mode`, () => {
      const palette = paletteFor(mode);
      const color = (token: string): Rgb => {
        const value = palette.get(token);
        if (!value) throw new Error(`${mode}: ${token} does not resolve to an opaque color`);
        return value;
      };

      it("should use a blue primary", () => {
        const { c, h } = toOklch(color("--ak-color-primary"));
        expect(h, `primary hue ${h.toFixed(1)}`).toBeGreaterThanOrEqual(BLUE_HUE[0]);
        expect(h, `primary hue ${h.toFixed(1)}`).toBeLessThanOrEqual(BLUE_HUE[1]);
        expect(c, "primary should be a confident, saturated blue").toBeGreaterThanOrEqual(0.1);
      });

      it("should keep every palette color free of purple hues", () => {
        expect(palette.size).toBeGreaterThan(20);
        const purple = [...palette]
          .map(([token, rgb]) => ({ token, ...toOklch(rgb) }))
          .filter(({ c, h }) => c > NEUTRAL_CHROMA && h >= PURPLE_HUE[0] && h <= PURPLE_HUE[1])
          .map(({ token, c, h }) => `${token} (C ${c.toFixed(3)}, H ${h.toFixed(1)})`);
        expect(purple, "shift plum-tinted tokens to blue or a cool slate").toEqual([]);
      });

      for (const [fg, bg, label] of TEXT_PAIRS) {
        it(`should meet WCAG AA 4.5:1 for ${label}`, () => {
          const ratio = contrast(color(fg), color(bg));
          expect(ratio, `${fg} on ${bg} = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
        });
      }
    });
  }

  it("should stay clearly distinct from the calico preset's muted blue", () => {
    const calico = parseOpaque(blockDeclarations(calicoCss, /calico/).get("--ak-color-primary")!)!;
    const primary = paletteFor("light").get("--ak-color-primary")!;
    const a = toOklch(primary);
    const b = toOklch(calico);
    const deltaE = Math.hypot(
      a.l - b.l,
      a.c * Math.cos((a.h * Math.PI) / 180) - b.c * Math.cos((b.h * Math.PI) / 180),
      a.c * Math.sin((a.h * Math.PI) / 180) - b.c * Math.sin((b.h * Math.PI) / 180),
    );
    expect(deltaE, `OKLab distance to calico ${deltaE.toFixed(3)}`).toBeGreaterThanOrEqual(0.08);
    expect(a.c, "default blue should be more saturated than calico").toBeGreaterThan(b.c + 0.04);
  });
});
