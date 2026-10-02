import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures";

/**
 * Measured quality heuristics over the whole `visual-check.html` audit surface.
 *
 * `visual-polish.spec.ts` proves the audit renders every family without
 * collapsed or overflowing geometry. This spec asserts defects that geometry
 * checks cannot see: labels broken inside a word, controls too small to hit,
 * wrapped chrome that strands a separator, and content that pokes out of the
 * viewport outside a declared scroll container. Each heuristic runs at every
 * width so a regression names the viewport and the offending element.
 *
 */

const WIDTHS = [320, 375, 768, 1440] as const;
type Width = (typeof WIDTHS)[number];

/** Narrowest width treated as a desktop pointer; below it hit areas are enforced. */
const TOUCH_MAX_WIDTH = 480;
/** WCAG 2.5.8 (Target Size, Minimum), CSS pixels. */
const MIN_HIT_AREA = 24;
const MIN_FONT_SIZE = 12;

const HEURISTICS = [
  "mid-word-break",
  "hit-area",
  "dangling-separator",
  "min-font-size",
  "viewport-overflow",
] as const;
type Heuristic = (typeof HEURISTICS)[number];

async function openAudit(page: Page, width: Width): Promise<void> {
  await page.setViewportSize({ width, height: 900 });
  await page.goto("/visual-check.html");
  await page.locator(".component-card").first().waitFor();
}

interface Measurement {
  violations: string[];
}

async function measure(
  page: Page,
  heuristic: Heuristic,
  limits: { hitArea: number; fontSize: number; touchMaxWidth: number },
): Promise<Measurement> {
  const violations = await page.evaluate(
    ([name, { hitArea, fontSize, touchMaxWidth }]) => {
      const visible = (element: Element): boolean =>
        element instanceof HTMLElement && element.checkVisibility();
      const previews = [...document.querySelectorAll(".preview")];
      const inPreviews = (selector: string): HTMLElement[] =>
        previews
          .flatMap((preview) => [...preview.querySelectorAll<HTMLElement>(selector)])
          .filter(visible);
      const describe = (element: Element): string => {
        const slot = element.getAttribute("data-slot") ?? element.tagName.toLowerCase();
        const text = (element.textContent ?? "").trim().replace(/\s+/gu, " ").slice(0, 28);
        const card = element.closest(".audit-card")?.querySelector("h3")?.textContent?.trim();
        return `${slot} "${text}"${card ? ` in "${card}"` : ""}`;
      };

      if (name === "mid-word-break") {
        const found = new Set<string>();
        const controls = inPreviews(
          'button, a, [role="tab"], [data-slot="badge"], [data-slot="tab"], [data-slot="pill"]',
        );
        const letterOrDigit = /[\p{L}\p{N}]/u;
        for (const control of controls) {
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
        const targets = inPreviews(
          [
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
          ].join(","),
        ).filter(
          (element) =>
            !(element as HTMLButtonElement).disabled &&
            element.getAttribute("aria-disabled") !== "true" &&
            // Inline links inside running text are exempt from WCAG 2.5.8.
            !(element.tagName === "A" && element.closest("p, dd, figcaption")),
        );
        const found = new Set<string>();
        for (const element of targets) {
          // A wrapping <label> is part of the control's activation target.
          const box = (element.closest("label") ?? element).getBoundingClientRect();
          const own = element.getBoundingClientRect();
          const width = Math.max(box.width, own.width);
          const height = Math.max(box.height, own.height);
          if (width < hitArea || height < hitArea) {
            found.add(`${describe(element)} ${Math.round(width)}x${Math.round(height)}`);
          }
        }
        return [...found];
      }

      if (name === "dangling-separator") {
        return inPreviews('[data-slot="breadcrumb-separator"]')
          .filter((separator) => {
            const next = [...(separator.parentElement?.children ?? [])]
              .slice([...(separator.parentElement?.children ?? [])].indexOf(separator) + 1)
              .find(visible);
            return (
              next !== undefined &&
              next.getBoundingClientRect().top >= separator.getBoundingClientRect().bottom - 1
            );
          })
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
      for (const element of inPreviews("*")) {
        const hasText = [...element.childNodes].some(
          (node) => node.nodeType === Node.TEXT_NODE && (node.textContent ?? "").trim() !== "",
        );
        if (hasText && Number.parseFloat(getComputedStyle(element).fontSize) < fontSize) {
          small.add(describe(element));
        }
      }
      return [...small];
    },
    [heuristic, limits] as const,
  );
  return { violations };
}

test.describe("audit heuristics", () => {
  for (const heuristic of HEURISTICS) {
    for (const width of WIDTHS) {
      test(`${heuristic} at ${width}px`, async ({ page }) => {
        await openAudit(page, width);
        const { violations } = await measure(page, heuristic, {
          hitArea: MIN_HIT_AREA,
          fontSize: MIN_FONT_SIZE,
          touchMaxWidth: TOUCH_MAX_WIDTH,
        });

        expect(violations, `${heuristic} at ${width}px`).toEqual([]);
      });
    }
  }
});
