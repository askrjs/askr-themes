import { ThemeScope } from "../../../src/theme";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";
import "../../../src/themes/presets/index.css";

/**
 * A consumer stylesheet loaded after the default theme and every preset, the
 * way an app adds token overrides after `@import "@askrjs/themes/default"`.
 * The spec toggles the sheet on and off to compare each mode's tokens with and
 * without the override, so no expectation depends on palette values.
 */
export const CONSUMER_STYLE_ID = "consumer-token-override";

function appendConsumerStyle(css: string): void {
  document.getElementById(CONSUMER_STYLE_ID)?.remove();
  const style = document.createElement("style");
  style.id = CONSUMER_STYLE_ID;
  style.textContent = css;
  document.head.append(style);
}

export default function consumerOverride(_root: HTMLElement, options: { css: string }): void {
  appendConsumerStyle(options.css);
}

/**
 * Two nested `ThemeScope`s, each with its own storage key, so the inner
 * scope's default theme decides the document theme on first mount.
 */
export async function nestedScopes(
  root: HTMLElement,
  options: { css: string; outer: string; inner: string },
): Promise<void> {
  appendConsumerStyle(options.css);
  window.localStorage.removeItem("askr-theme-override-outer");
  window.localStorage.removeItem("askr-theme-override-inner");

  await mountRoute(root, "/consumer-token-override", () => (
    <ThemeScope defaultTheme={options.outer} storageKey="askr-theme-override-outer">
      <ThemeScope defaultTheme={options.inner} storageKey="askr-theme-override-inner">
        <p data-probe="scope">Scoped content</p>
      </ThemeScope>
    </ThemeScope>
  ));
}
