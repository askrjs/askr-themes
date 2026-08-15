import { describe, it, expect } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { THEMES_DIR } from "./test-paths";

const OFFICIAL_THEMES = ["default"] as const;

/**
 * Parse a CSS color value (#hex or rgb/rgba) to [r, g, b, a] (0-255, alpha 0-1).
 */
function parseColor(value: string): [number, number, number, number] | null {
  const trimmed = value.trim();

  // #rrggbb or #rgb
  const hexMatch = trimmed.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
        1,
      ];
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        1,
      ];
    }
  }

  // rgb(r, g, b) or rgba(r, g, b, a)
  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([0-9.]+))?\s*\)/,
  );
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10),
      rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1,
    ];
  }

  const oklchMatch = trimmed.match(
    /^oklch\(\s*([+-]?(?:\d*\.?\d+))(%)?\s+([+-]?(?:\d*\.?\d+))(%)?\s+([+-]?(?:\d*\.?\d+))(?:deg)?(?:\s*\/\s*([+-]?(?:\d*\.?\d+))(%)?)?\s*\)$/i,
  );
  if (oklchMatch) {
    const lightness = Number(oklchMatch[1]) / (oklchMatch[2] ? 100 : 1);
    const chroma = Number(oklchMatch[3]) / (oklchMatch[4] ? 100 : 1);
    const hue = (Number(oklchMatch[5]) * Math.PI) / 180;
    const a = chroma * Math.cos(hue);
    const b = chroma * Math.sin(hue);
    const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const linear = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    const rgb = linear.map(
      (channel) =>
        255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055),
    );
    const alpha =
      oklchMatch[6] === undefined ? 1 : Number(oklchMatch[6]) / (oklchMatch[7] ? 100 : 1);
    return [rgb[0]!, rgb[1]!, rgb[2]!, alpha];
  }

  return null;
}

it("should parse OKLCH lightness percentages independently from chroma", () => {
  const mixedUnits = parseColor("oklch(62% 0.12 30)");
  const decimalUnits = parseColor("oklch(0.62 0.12 30)");

  expect(mixedUnits).not.toBeNull();
  expect(decimalUnits).not.toBeNull();
  for (const [mixed, decimal] of mixedUnits!
    .slice(0, 3)
    .map((channel, index) => [channel, decimalUnits![index]])) {
    expect(mixed).toBeCloseTo(decimal as number, 8);
  }
});

/**
 * Composite a semi-transparent foreground color over an opaque background.
 */
function compositeOver(
  fg: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number] {
  const a = fg[3];
  return [
    Math.round(fg[0] * a + bg[0] * (1 - a)),
    Math.round(fg[1] * a + bg[1] * (1 - a)),
    Math.round(fg[2] * a + bg[2] * (1 - a)),
  ];
}

/**
 * Compute relative luminance per WCAG 2.1.
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Compute WCAG contrast ratio between two opaque RGB colors.
 */
function contrastRatio(c1: [number, number, number], c2: [number, number, number]): number {
  const l1 = relativeLuminance(...c1);
  const l2 = relativeLuminance(...c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Resolve a parsed color to opaque RGB by compositing over a background if needed.
 */
function resolveToOpaque(
  color: [number, number, number, number],
  bg: [number, number, number, number],
): [number, number, number] {
  if (color[3] >= 1) return [color[0], color[1], color[2]];
  return compositeOver(color, bg);
}

/**
 * Extract color token definitions from a CSS block matching a selector.
 */
function extractColorTokens(
  css: string,
  selectorTest: (sel: string) => boolean,
): Map<string, string> {
  const tokens = new Map<string, string>();
  const blockPattern = /([^{}]+)\{([^{}]*)\}/gms;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(css))) {
    const selectors = match[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!selectors.some(selectorTest)) continue;

    const body = match[2];
    const tokenMatches = body.matchAll(/(--ak-color-[a-z0-9-]+)\s*:\s*([^;]+)/g);
    for (const tm of tokenMatches) {
      tokens.set(tm[1], tm[2].trim());
    }
  }

  return tokens;
}

function extractAllTokenValues(css: string): Map<string, string> {
  const tokens = new Map<string, string>();
  const blockPattern = /([^{}]+)\{([^{}]*)\}/gms;
  let match: RegExpExecArray | null;

  while ((match = blockPattern.exec(css))) {
    const body = match[2];
    const tokenMatches = body.matchAll(/(--ak-[a-z0-9-]+)\s*:\s*([^;]+)/g);
    for (const tm of tokenMatches) {
      tokens.set(tm[1], tm[2].trim());
    }
  }

  return tokens;
}

function resolveTokenValue(
  value: string,
  tokenValues: Map<string, string>,
  seen = new Set<string>(),
): string {
  const trimmed = value.trim();
  const varMatch = trimmed.match(/^var\((--ak-[a-z0-9-]+)\)$/);

  if (!varMatch) {
    return trimmed;
  }

  const token = varMatch[1];

  if (seen.has(token)) {
    return trimmed;
  }

  const nextValue = tokenValues.get(token);
  if (!nextValue) {
    return trimmed;
  }

  seen.add(token);
  return resolveTokenValue(nextValue, tokenValues, seen);
}

/**
 * WCAG AA contrast pairs: [foreground token, background token, min ratio, label].
 * 4.5:1 for normal text, 3:1 for large text / UI components.
 */
const CONTRAST_PAIRS: [string, string, number, string][] = [
  // Text on backgrounds
  ["--ak-color-text", "--ak-color-bg", 4.5, "text on bg"],
  ["--ak-color-text", "--ak-color-surface", 4.5, "text on surface"],
  ["--ak-color-text-muted", "--ak-color-bg", 3, "muted text on bg"],
  ["--ak-color-text-muted", "--ak-color-surface", 3, "muted text on surface"],

  // Inverse text on primary
  ["--ak-color-text-inverse", "--ak-color-primary", 4.5, "inverse text on primary"],

  // Status ink on status soft
  ["--ak-color-success-ink", "--ak-color-success-soft", 3, "success ink on soft"],
  ["--ak-color-warning-ink", "--ak-color-warning-soft", 3, "warning ink on soft"],
  ["--ak-color-danger-ink", "--ak-color-danger-soft", 3, "danger ink on soft"],
  ["--ak-color-info-ink", "--ak-color-info-soft", 3, "info ink on soft"],

  // Primary ink on primary soft (badge default)
  ["--ak-color-primary-ink", "--ak-color-primary-soft", 3, "primary ink on soft"],

  // Link on backgrounds
  ["--ak-color-link", "--ak-color-bg", 3, "link on bg"],
  ["--ak-color-link", "--ak-color-surface", 3, "link on surface"],

  // Canonical semantic pairings. These are public token contracts, not
  // component-specific approximations.
  ["--ak-color-text-subtle", "--ak-color-surface", 4.5, "subtle text on surface"],
  ["--ak-color-border-strong", "--ak-color-surface", 3, "strong border on surface"],
  ["--ak-color-warning", "--ak-color-surface", 3, "warning UI on surface"],
  ["--ak-color-info", "--ak-color-surface", 3, "info UI on surface"],

  // The one shared focus-ring token must remain visible on every documented
  // surface where a default-theme control can appear.
  ["--ak-color-focus-ring", "--ak-color-bg", 3, "focus ring on page"],
  ["--ak-color-focus-ring", "--ak-color-surface", 3, "focus ring on surface"],
  ["--ak-color-focus-ring", "--ak-color-surface-muted", 3, "focus ring on muted surface"],
  ["--ak-color-focus-ring", "--ak-color-surface-raised", 3, "focus ring on raised surface"],
  ["--ak-color-focus-ring", "--ak-color-surface-overlay", 3, "focus ring on overlay surface"],
  ["--ak-color-focus-ring", "--ak-color-primary", 3, "focus ring on primary surface"],
];

const ELEVATION_LAYERS = [
  "--ak-color-bg",
  "--ak-color-surface",
  "--ak-color-surface-raised",
  "--ak-color-surface-overlay",
] as const;

describe("WCAG AA contrast", () => {
  for (const theme of OFFICIAL_THEMES) {
    describe(`${theme} theme`, () => {
      const css = readFileSync(join(THEMES_DIR, theme, "tokens.css"), "utf-8");

      for (const mode of ["light", "dark"] as const) {
        describe(`${mode} mode`, () => {
          const selectorTest =
            mode === "light"
              ? (s: string) => /\[data-theme=(['"])light\1\]/.test(s)
              : (s: string) => /\[data-theme=(['"])dark\1\]/.test(s);

          const tokens = extractColorTokens(css, selectorTest);
          const allTokenValues = extractAllTokenValues(css);
          const tokenValues = new Map([...allTokenValues, ...tokens]);

          // Get the page bg for compositing semi-transparent colors
          const pageBgValue = tokens.get("--ak-color-bg");
          const pageBg = pageBgValue
            ? parseColor(resolveTokenValue(pageBgValue, tokenValues))
            : null;

          for (const [fgToken, bgToken, minRatio, label] of CONTRAST_PAIRS) {
            it(`should ${label} (${minRatio}:1)`, () => {
              const fgValue = tokens.get(fgToken);
              const bgValue = tokens.get(bgToken);

              if (!fgValue || !bgValue) {
                throw new Error(`Missing contrast token: ${fgToken} or ${bgToken}`);
              }

              const fgParsed = parseColor(resolveTokenValue(fgValue, tokenValues));
              const bgParsed = parseColor(resolveTokenValue(bgValue, tokenValues));

              if (!fgParsed || !bgParsed) {
                throw new Error(
                  `Unsupported contrast color syntax: ${fgValue} or ${bgValue}; use the browser contrast matrix for verification.`,
                );
              }

              // Composite semi-transparent bg over page background
              const baseBg = pageBg ?? ([255, 255, 255, 1] as [number, number, number, number]);
              const bg = resolveToOpaque(bgParsed, baseBg);
              // A translucent foreground is the color users actually see
              // after it composites over the surface. Ignoring alpha here
              // would allow an invisible focus ring to pass.
              const fg = resolveToOpaque(fgParsed, [...bg, 1]);

              const ratio = contrastRatio(fg, bg);
              expect(
                ratio,
                `${label}: ${fgToken} (${fgValue}) on ${bgToken} (${bgValue}) = ${ratio.toFixed(2)}:1, need ${minRatio}:1`,
              ).toBeGreaterThanOrEqual(minRatio);
            });
          }

          it("should keep the documented elevation layers visually distinct", () => {
            const resolvedLayers = ELEVATION_LAYERS.map((token) => {
              const value = tokens.get(token);
              if (!value) throw new Error(`Missing elevation token: ${token}`);
              const parsed = parseColor(resolveTokenValue(value, tokenValues));
              if (!parsed) throw new Error(`Unsupported elevation color: ${token} (${value})`);
              return resolveToOpaque(parsed, pageBg ?? [255, 255, 255, 1]);
            });

            expect(
              new Set(resolvedLayers.map((color) => color.map(Math.round).join(","))).size,
            ).toBe(ELEVATION_LAYERS.length);
          });
        });
      }
    });
  }
});
