import "../../../src/themes/default/index.css";
import "../../../src/themes/presets/index.css";

/** One token pair resolved by the browser to computed colour strings. */
export interface ResolvedPair {
  color: string;
  backgroundColor: string;
  pageColor: string;
}

/**
 * Builds the three probe elements the contrast contract measures against and
 * exposes a `resolve` control: the spec hands it a theme plus every token pair
 * and gets the computed colour strings back in one round trip. The colour math
 * itself stays in the spec — only `var()` resolution needs a browser.
 */
export default function contrastProbes(root: HTMLElement): {
  resolve: (theme: string, pairs: [string, string][]) => ResolvedPair[];
} {
  const foreground = document.createElement("span");
  const background = document.createElement("span");
  const page = document.createElement("div");
  page.style.backgroundColor = "var(--ak-color-bg)";
  foreground.style.color = "var(--ak-color-text)";
  background.style.backgroundColor = "var(--ak-color-bg)";
  page.append(foreground, background);
  root.append(page);

  return {
    resolve: (theme, pairs) => {
      document.documentElement.setAttribute("data-theme", theme);
      return pairs.map(([foregroundToken, backgroundToken]) => {
        foreground.style.color = `var(${foregroundToken})`;
        background.style.backgroundColor = `var(${backgroundToken})`;
        return {
          color: getComputedStyle(foreground).color,
          backgroundColor: getComputedStyle(background).backgroundColor,
          pageColor: getComputedStyle(page).backgroundColor,
        };
      });
    },
  };
}
