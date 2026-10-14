import type { Page } from "@playwright/test";

/**
 * Measured quality heuristics shared by the audit-page spec and the
 * real-component spec. Each heuristic returns the offending elements, so a
 * failure names what to fix. They measure rendered geometry, not CSS text, so
 * they hold whatever rule or markup produced the layout.
 */

export const WIDTHS = [320, 375, 768, 1440] as const;
export type Width = (typeof WIDTHS)[number];

export const HEURISTICS = [
  "mid-word-break",
  "hit-area",
  "dangling-separator",
  "truncated-current",
  "min-font-size",
  "viewport-overflow",
] as const;
export type Heuristic = (typeof HEURISTICS)[number];

/** Narrowest width treated as a desktop pointer; below it hit areas are enforced. */
export const TOUCH_MAX_WIDTH = 480;
/** WCAG 2.5.8 (Target Size, Minimum), CSS pixels. */
export const MIN_HIT_AREA = 24;
export const MIN_FONT_SIZE = 12;

export interface Limits {
  hitArea: number;
  fontSize: number;
  touchMaxWidth: number;
}

export const DEFAULT_LIMITS: Limits = {
  hitArea: MIN_HIT_AREA,
  fontSize: MIN_FONT_SIZE,
  touchMaxWidth: TOUCH_MAX_WIDTH,
};

/**
 * Runs one heuristic over every element inside `scope` (a CSS selector for the
 * regions to audit) and returns the violations.
 */
export async function measure(
  page: Page,
  heuristic: Heuristic,
  scope: string,
  limits: Limits = DEFAULT_LIMITS,
): Promise<string[]> {
  return page.evaluate(
    ([name, scopeSelector, { hitArea, fontSize, touchMaxWidth }]) => {
      const visible = (element: Element): boolean =>
        element instanceof HTMLElement && element.checkVisibility();
      const regions = [...document.querySelectorAll(scopeSelector)];
      const within = (selector: string): HTMLElement[] =>
        regions
          .flatMap((region) => [...region.querySelectorAll<HTMLElement>(selector)])
          .filter(visible);
      const describe = (element: Element): string => {
        const slot = element.getAttribute("data-slot") ?? element.tagName.toLowerCase();
        const text = (element.textContent ?? "").trim().replace(/\s+/gu, " ").slice(0, 28);
        const card = element.closest(".audit-card")?.querySelector("h3")?.textContent?.trim();
        return `${slot} "${text}"${card ? ` in "${card}"` : ""}`;
      };

      if (name === "mid-word-break") {
        const found = new Set<string>();
        const labelled = within(
          [
            "button",
            "a",
            "label",
            '[role="tab"]',
            '[role="menuitem"]',
            '[data-slot="badge"]',
            '[data-slot="tab"]',
            '[data-slot="pill"]',
            '[data-slot="nav-item"]',
          ].join(","),
        );
        const letterOrDigit = /[\p{L}\p{N}]/u;
        for (const control of labelled) {
          const walker = document.createTreeWalker(control, NodeFilter.SHOW_TEXT);
          for (let node = walker.nextNode(); node; node = walker.nextNode()) {
            const text = node.textContent ?? "";
            const range = document.createRange();
            const rectOf = (index: number): DOMRect | undefined => {
              range.setStart(node, index);
              range.setEnd(node, index + 1);
              return range.getClientRects()[0];
            };
            for (let index = 0; index < text.length - 1; index += 1) {
              if (!letterOrDigit.test(text[index]!) || !letterOrDigit.test(text[index + 1]!)) {
                continue;
              }
              const a = rectOf(index);
              const b = rectOf(index + 1);
              if (a && b && b.top >= a.bottom - a.height / 2) {
                found.add(describe(control));
                break;
              }
            }
          }
        }
        return [...found];
      }

      if (name === "hit-area") {
        if (window.innerWidth > touchMaxWidth) return [];
        const controlSelector = [
          "button",
          "a[href]",
          "input:not([type=hidden])",
          "select",
          "textarea",
          '[role="tab"]',
          '[role="switch"]',
          '[role="checkbox"]',
          '[role="radio"]',
          '[role="menuitem"]',
        ].join(",");
        const targets = within(controlSelector).filter(
          (element) =>
            !(element as HTMLButtonElement).disabled &&
            element.getAttribute("aria-disabled") !== "true" &&
            // Inline links inside running text are exempt from WCAG 2.5.8.
            !(element.tagName === "A" && element.closest("p, dd, figcaption")),
        );
        const found = new Set<string>();
        for (const element of targets) {
          // A wrapping <label> extends the target only when it labels this one control;
          // a label around several controls says nothing about any single one.
          const label = element.closest("label");
          const labelsOnlyThis =
            label !== null && label.querySelectorAll(controlSelector).length === 1;
          const own = element.getBoundingClientRect();
          const box = labelsOnlyThis ? label.getBoundingClientRect() : own;
          const width = Math.max(box.width, own.width);
          const height = Math.max(box.height, own.height);
          if (width < hitArea || height < hitArea) {
            found.add(`${describe(element)} ${Math.round(width)}x${Math.round(height)}`);
          }
        }
        return [...found];
      }

      if (name === "dangling-separator") {
        return within('[data-slot="breadcrumb-separator"]')
          .filter((separator) => {
            const siblings = [...(separator.parentElement?.children ?? [])];
            const next = siblings.slice(siblings.indexOf(separator) + 1).find(visible);
            return (
              next !== undefined &&
              next.getBoundingClientRect().top >= separator.getBoundingClientRect().bottom - 1
            );
          })
          .map(describe);
      }

      if (name === "truncated-current") {
        // The current page is the one label a reader must always be able to read in full.
        return within('[aria-current="page"]')
          .filter((element) => element.scrollWidth > element.clientWidth + 1)
          .map(describe);
      }

      if (name === "viewport-overflow") {
        const root = document.documentElement;
        const found = new Set<string>();
        if (root.scrollWidth > window.innerWidth) {
          found.add(`document ${root.scrollWidth}px > viewport ${window.innerWidth}px`);
        }
        for (const element of document.querySelectorAll<HTMLElement>("body *")) {
          if (!visible(element)) continue;
          const bounds = element.getBoundingClientRect();
          if (bounds.width === 0 || (bounds.right <= window.innerWidth + 1 && bounds.left >= -1)) {
            continue;
          }
          // Content wider than the viewport is fine inside a declared scroll container.
          let ancestor = element.parentElement;
          while (ancestor && ancestor !== root) {
            if (/auto|scroll/u.test(getComputedStyle(ancestor).overflowX)) break;
            ancestor = ancestor.parentElement;
          }
          if (ancestor === root || ancestor === null) found.add(describe(element));
        }
        return [...found];
      }

      const small = new Set<string>();
      for (const element of within("*")) {
        const hasText = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
        );
        if (hasText && Number.parseFloat(getComputedStyle(element).fontSize) < fontSize) {
          small.add(describe(element));
        }
      }
      return [...small];
    },
    [heuristic, scope, limits] as const,
  );
}
