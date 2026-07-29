import { afterEach, describe, expect, it } from "vite-plus/test";

import "../../src/themes/default/index.css";
import "../../src/themes/presets/index.css";

type RGBA = [number, number, number, number];
type RGB = [number, number, number];

const PAIRS: readonly [string, string, number][] = [
  ["--ak-color-text", "--ak-color-bg", 4.5],
  ["--ak-color-text", "--ak-color-surface", 4.5],
  ["--ak-color-text-muted", "--ak-color-bg", 3],
  ["--ak-color-text-muted", "--ak-color-surface", 3],
  ["--ak-color-text-inverse", "--ak-color-primary", 4.5],
  ["--ak-color-success-ink", "--ak-color-success-soft", 3],
  ["--ak-color-warning-ink", "--ak-color-warning-soft", 3],
  ["--ak-color-danger-ink", "--ak-color-danger-soft", 3],
  ["--ak-color-info-ink", "--ak-color-info-soft", 3],
  ["--ak-color-primary-ink", "--ak-color-primary-soft", 3],
  ["--ak-color-link", "--ak-color-bg", 3],
];

const THEMES = ["light", "dark", "ginger", "tabby", "tuxedo", "calico", "torty"] as const;

function parseComputedColor(value: string): RGBA {
  const rgb = value.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[/,]\s*([\d.]+))?/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3]), Number(rgb[4] ?? 1)];

  const oklch = value.match(
    /oklch\(\s*([+-]?(?:\d*\.?\d+))(%)?\s+([+-]?(?:\d*\.?\d+))(%)?\s+([+-]?(?:\d*\.?\d+))(?:deg)?(?:\s*[/]\s*([+-]?(?:\d*\.?\d+))(%)?)?/i,
  );
  if (!oklch) throw new Error(`Browser did not resolve color to a supported format: ${value}`);
  const lightness = Number(oklch[1]) / (oklch[2] ? 100 : 1);
  const chroma = Number(oklch[3]) / (oklch[4] ? 100 : 1);
  const hue = (Number(oklch[5]) * Math.PI) / 180;
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
  const srgb = linear.map(
    (channel) =>
      255 * (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055),
  );
  const alpha = oklch[6] === undefined ? 1 : Number(oklch[6]) / (oklch[7] ? 100 : 1);
  return [srgb[0]!, srgb[1]!, srgb[2]!, alpha];
}

function luminance([r, g, b]: RGB): number {
  const linear = [r, g, b].map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
}

function composite(color: RGBA, background: RGB): RGB {
  const alpha = color[3];
  return [
    color[0] * alpha + background[0] * (1 - alpha),
    color[1] * alpha + background[1] * (1 - alpha),
    color[2] * alpha + background[2] * (1 - alpha),
  ];
}

function contrast(foreground: RGBA, background: RGBA, page: RGB): number {
  const backgroundRgb = composite(background, page);
  const foregroundRgb = composite(foreground, backgroundRgb);
  const foregroundLuminance = luminance(foregroundRgb);
  const backgroundLuminance = luminance(backgroundRgb);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

describe("computed WCAG contrast", () => {
  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
  });

  for (const theme of THEMES) {
    it(`should keep ${theme} text and control colors readable`, () => {
      document.documentElement.setAttribute("data-theme", theme);
      const foreground = document.createElement("span");
      const background = document.createElement("span");
      const page = document.createElement("div");
      page.style.backgroundColor = "var(--ak-color-bg)";
      foreground.style.color = "var(--ak-color-text)";
      background.style.backgroundColor = "var(--ak-color-bg)";
      page.append(foreground, background);
      document.body.append(page);

      try {
        for (const [foregroundToken, backgroundToken, minimum] of PAIRS) {
          foreground.style.color = `var(${foregroundToken})`;
          background.style.backgroundColor = `var(${backgroundToken})`;
          const foregroundColor = parseComputedColor(getComputedStyle(foreground).color);
          const backgroundColor = parseComputedColor(getComputedStyle(background).backgroundColor);
          const pageColor = parseComputedColor(getComputedStyle(page).backgroundColor);
          expect(
            contrast(foregroundColor, backgroundColor, [pageColor[0], pageColor[1], pageColor[2]]),
            `${theme}: ${foregroundToken} on ${backgroundToken}`,
          ).toBeGreaterThanOrEqual(minimum);
        }
      } finally {
        page.remove();
      }
    });
  }
});
