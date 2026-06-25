import { describe, it, expect } from "vite-plus/test";
import { readFileSync, readdirSync, type Dirent } from "node:fs";
import { join } from "node:path";

import { DEFAULT_THEME_STYLES_DIR, DEFAULT_THEME_TOKENS_FILE } from "./test-paths";

const COMPONENTS_DIR = DEFAULT_THEME_STYLES_DIR;
const TOKENS_FILE = DEFAULT_THEME_TOKENS_FILE;
const CLASS_UTILITY_FILES = new Set([
  "alert.css",
  "badge.css",
  "button.css",
  "button-group.css",
  "card.css",
  "avatar.css",
  "dropdown.css",
  "field.css",
  "input-group.css",
  "input.css",
  "label.css",
  "list-group.css",
  "nav.css",
  "pagination.css",
  "patterns.css",
  "reset.css",
  "utilities.css",
  "textarea.css",
  "theme.css",
  "typography.css",
  "select.css",
]);
const PLAIN_CLASS_CONTRACT_FILES = new Set([
  "alert.css",
  "badge.css",
  "button.css",
  "button-group.css",
  "card.css",
  "avatar.css",
  "dropdown.css",
  "field.css",
  "input-group.css",
  "input.css",
  "label.css",
  "list-group.css",
  "pagination.css",
  "patterns.css",
  "utilities.css",
  "textarea.css",
  "select.css",
]);
const ALLOWED_ALIAS_CLASSES: Record<string, readonly string[]> = {
  "alert.css": [
    "alert",
    "alert-actions",
    "alert-close",
    "alert-content",
    "alert-description",
    "alert-danger",
    "alert-info",
    "alert-icon",
    "alert-success",
    "alert-title",
    "alert-warning",
  ],
  "badge.css": [
    "badge",
    "badge-danger",
    "badge-info",
    "badge-outline",
    "badge-secondary",
    "badge-success",
    "badge-warning",
  ],
  "avatar.css": ["avatar", "avatar-fallback", "avatar-image"],
  "button.css": [
    "btn",
    "btn-close",
    "btn-destructive",
    "btn-ghost",
    "btn-icon",
    "btn-lg",
    "btn-link",
    "btn-outline",
    "btn-primary",
    "btn-secondary",
    "btn-sm",
  ],
  "button-group.css": ["btn", "btn-group", "btn-group-vertical"],
  "card.css": [
    "card",
    "card-actions",
    "card-content",
    "card-description",
    "card-footer",
    "card-header",
    "card-lg",
    "card-raised",
    "card-sm",
    "card-title",
  ],
  "field.css": ["field", "field-error", "field-hint"],
  "dropdown.css": [
    "dropdown-content",
    "dropdown-item",
    "dropdown-label",
    "dropdown-separator",
    "dropdown-trigger",
  ],
  "input-group.css": [
    "btn",
    "input",
    "input-group",
    "input-group-text",
    "input-group-vertical",
    "select-trigger",
    "textarea",
  ],
  "input.css": ["input", "input-lg", "input-sm"],
  "label.css": ["label"],
  "list-group.css": [
    "active",
    "disabled",
    "list-group",
    "list-group-flush",
    "list-group-horizontal",
    "list-group-item",
    "list-group-item-action",
  ],
  "pagination.css": [
    "active",
    "disabled",
    "page-item",
    "page-link",
    "pagination",
    "pagination-ellipsis",
    "pagination-list",
  ],
  "patterns.css": [
    "empty-state",
    "empty-state-actions",
    "empty-state-description",
    "empty-state-icon",
    "empty-state-title",
    "eyebrow",
    "icon-badge",
    "section-header",
    "section-header-copy",
    "section-header-description",
    "site-footer",
  ],
  "utilities.css": [
    "flex-col",
    "flex-col-reverse",
    "flex-nowrap",
    "flex-row-reverse",
    "flex-wrap-reverse",
    "gap-1",
    "gap-2",
    "gap-3",
    "gap-4",
    "gap-lg",
    "gap-md",
    "gap-sm",
    "gap-xl",
    "gap-xs",
    "gap-x-lg",
    "gap-x-md",
    "gap-x-sm",
    "gap-y-lg",
    "gap-y-md",
    "gap-y-sm",
    "sr-only",
    "items-baseline",
    "items-center",
    "items-end",
    "items-start",
    "items-stretch",
    "justify-between",
    "justify-center",
    "justify-end",
    "justify-start",
    "text-bold",
    "text-muted",
  ],
  "select.css": [
    "select-content",
    "select-group",
    "select-item",
    "select-label",
    "select-separator",
    "select-trigger-lg",
    "select-trigger-sm",
    "select-trigger",
    "select-value",
  ],
  "textarea.css": ["textarea", "textarea-lg", "textarea-sm"],
};

function getComponentCssFiles(): string[] {
  function collect(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry: Dirent) => {
      const entryPath = join(dir, entry.name);

      if (entry.isDirectory()) {
        return collect(entryPath);
      }

      return entry.name.endsWith(".css") ? [entryPath] : [];
    });
  }

  return collect(COMPONENTS_DIR).sort();
}

function splitSelectorList(selectorList: string): string[] {
  const selectors: string[] = [];
  let current = "";
  let bracketDepth = 0;
  let parenDepth = 0;

  for (const ch of selectorList) {
    if (ch === "[") bracketDepth++;
    if (ch === "]") bracketDepth--;
    if (ch === "(") parenDepth++;
    if (ch === ")") parenDepth--;

    if (ch === "," && bracketDepth === 0 && parenDepth === 0) {
      if (current.trim()) {
        selectors.push(current.trim());
      }
      current = "";
      continue;
    }

    current += ch;
  }

  if (current.trim()) {
    selectors.push(current.trim());
  }

  return selectors;
}

function unwrapFunctionalPseudoClasses(selector: string): string {
  const functionalPseudoPrefixes = [":where(", ":is(", ":has(", ":not("] as const;
  let output = "";

  for (let index = 0; index < selector.length; index++) {
    const prefix = functionalPseudoPrefixes.find((candidate) =>
      selector.startsWith(candidate, index),
    );

    if (!prefix) {
      output += selector[index];
      continue;
    }

    const contentStart = index + prefix.length;
    let depth = 1;
    let contentEnd = contentStart;

    for (; contentEnd < selector.length; contentEnd++) {
      const char = selector[contentEnd];

      if (char === "(") {
        depth++;
      }

      if (char === ")") {
        depth--;
      }

      if (depth === 0) {
        break;
      }
    }

    const contents = selector.slice(contentStart, contentEnd);
    output += ` ${unwrapFunctionalPseudoClasses(contents).replace(/,\s*/g, " ")} `;
    index = contentEnd;
  }

  return output;
}

/**
 * Extract top-level selectors from CSS text.
 * Handles comma-separated selectors and media query contents.
 */
function extractSelectors(css: string): string[] {
  // Strip comments
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, "");

  const selectors: string[] = [];
  let depth = 0;
  let current = "";
  let inMediaOrSupports = false;

  for (let i = 0; i < stripped.length; i++) {
    const ch = stripped[i];

    if (ch === "{") {
      if (depth === 0) {
        // Check if this is a @media / @supports block
        const trimmed = current.trim();
        if (trimmed.startsWith("@media") || trimmed.startsWith("@supports")) {
          inMediaOrSupports = true;
          current = "";
          depth++;
          continue;
        }
        if (trimmed.startsWith("@layer")) {
          current = "";
          depth++;
          continue;
        }
        if (trimmed.startsWith("@keyframes")) {
          // Skip the entire @keyframes block
          current = "";
          depth++;
          continue;
        }
        // It's a selector — split on commas for compound selectors
        selectors.push(...splitSelectorList(trimmed));
        current = "";
      } else if (depth === 1 && inMediaOrSupports) {
        // Selector inside @media block
        const trimmed = current.trim();
        selectors.push(...splitSelectorList(trimmed));
        current = "";
      }
      depth++;
      continue;
    }

    if (ch === "}") {
      depth--;
      if (depth === 0 && inMediaOrSupports) {
        inMediaOrSupports = false;
      }
      current = "";
      continue;
    }

    if (depth === 0 || (depth === 1 && inMediaOrSupports)) {
      current += ch;
    }
  }

  return selectors;
}

/**
 * Allowed selector patterns:
 * - Attribute selectors: [data-*], [data-slot="..."], [data-state="..."], etc.
 * - Pseudo-classes: :hover, :focus-visible, :root, :first-child, :where(...), etc.
 * - Pseudo-elements: ::before, ::after, ::placeholder, etc.
 * - Bare svg inside a :where(...) list for icon normalization.
 * - Combinators between allowed parts: >, +, ~, space
 *
 * Forbidden:
 * - Class selectors: .foo
 * - ID selectors: #foo
 * - Bare element/type selectors: div, button, span, etc.
 */
function validateSelector(selector: string): {
  valid: boolean;
  reason?: string;
} {
  const normalized = unwrapFunctionalPseudoClasses(selector);
  // Split on combinators but keep the parts
  // A selector like `[data-slot="a"] [data-slot="b"]` has two parts
  const parts = normalized
    .split(/(?<=\])[\s>+~]+(?=\[|\bsvg\b)|(?<=\))[\s>+~]+(?=\[|\bsvg\b)|(?<=\bsvg)[\s>+~]+(?=\[)/)
    .map((s) => s.trim())
    .filter(Boolean);

  for (const part of parts) {
    // Each part should be composed of:
    // - attribute selectors [...]
    // - pseudo-classes :foo
    // - pseudo-elements ::foo

    // Check for class selectors
    if (/(?<!\[)\.\w/.test(part)) {
      return { valid: false, reason: `class selector found: "${part}"` };
    }

    // Check for ID selectors
    if (/#\w/.test(part)) {
      return { valid: false, reason: `ID selector found: "${part}"` };
    }

    if (part === "svg") {
      continue;
    }

    // Strip attribute selectors, pseudo-elements, pseudo-classes
    let remainder = part;
    // Remove attribute selectors [...]
    remainder = remainder.replace(/\[[^\]]*\]/g, "");
    // Remove pseudo-elements ::foo(...)
    remainder = remainder.replace(/::[a-z-]+(\([^)]*\))?/g, "");
    // Remove pseudo-classes :foo(...)
    remainder = remainder.replace(/:[a-z-]+(\([^)]*\))?/g, "");
    // Remove combinators and whitespace
    remainder = remainder.replace(/[\s>+~]+/g, "").trim();

    // After stripping, nothing should remain (no bare element selectors)
    if (remainder.length > 0) {
      return {
        valid: false,
        reason: `bare element or unexpected selector fragment: "${remainder}" in "${part}"`,
      };
    }
  }

  return { valid: true };
}

describe("CSS selector contract", () => {
  const files = getComponentCssFiles();

  it("should find component CSS files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const filename = file.split(/[/\\]/).pop()!;

    it(`should ${filename}: uses only data-attribute selectors (no classes, IDs, or elements)`, () => {
      if (CLASS_UTILITY_FILES.has(filename)) {
        return;
      }

      const css = readFileSync(file, "utf-8");
      const selectors = extractSelectors(css);

      const violations: string[] = [];
      for (const sel of selectors) {
        const result = validateSelector(sel);
        if (!result.valid) {
          violations.push(`${result.reason} in selector "${sel}"`);
        }
      }

      expect(violations).toEqual([]);
    });
  }
});

describe("plain class contract", () => {
  const files = getComponentCssFiles().filter((file) =>
    PLAIN_CLASS_CONTRACT_FILES.has(file.split(/[/\\]/).pop()!),
  );

  it("should find class-contract CSS files", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    const filename = file.split(/[/\\]/).pop()!;

    it(`should ${filename}: uses plain kebab-case classes without an ak class prefix`, () => {
      const css = readFileSync(file, "utf-8");
      const classNames = [...css.matchAll(/\.([_a-zA-Z][_a-zA-Z0-9-]*)/g)].map((match) => match[1]);
      const violations = classNames.filter(
        (className) =>
          className.startsWith("ak-") || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(className),
      );

      expect(violations).toEqual([]);
    });

    it(`should ${filename}: only exposes approved public classes`, () => {
      const css = readFileSync(file, "utf-8");
      const classNames = [...css.matchAll(/\.([_a-zA-Z][_a-zA-Z0-9-]*)/g)].map((match) => match[1]);
      const allowed = new Set(ALLOWED_ALIAS_CLASSES[filename] ?? []);
      const violations = classNames.filter((className) => !allowed.has(className));

      expect(violations).toEqual([]);
    });
  }
});

describe("legacy shell selector cleanup", () => {
  const files = getComponentCssFiles();
  const legacyShellSlotPattern =
    /\[data-slot="(shell|shell-main|shell-nav|sidebar-panel|sidebar-toggle|sidebar-backdrop|sidebar-rail-toggle)"\]/;

  for (const file of files) {
    const filename = file.split(/[/\\]/).pop()!;

    it(`should ${filename}: does not expose removed shell slots`, () => {
      const css = readFileSync(file, "utf-8");
      const selectors = extractSelectors(css);

      const violations = selectors.filter((selector) => {
        const normalized = selector.replace(/:where\(([^()]*)\)/g, "$1");
        return legacyShellSlotPattern.test(normalized);
      });

      expect(
        violations,
        `Removed shell slots must stay out of CSS: ${violations.join(", ")}`,
      ).toEqual([]);
    });
  }
});

describe("tokens.css selector contract", () => {
  it("should uses only :root and [data-theme] selectors", () => {
    const css = readFileSync(TOKENS_FILE, "utf-8");
    const selectors = extractSelectors(css);

    for (const sel of selectors) {
      const isRoot = sel === ":root";
      const isRootNot = sel === ":root:not([data-theme])";
      const isDataTheme = sel.startsWith("[data-theme=");
      expect(
        isRoot || isRootNot || isDataTheme,
        `Unexpected selector in tokens.css: "${sel}"`,
      ).toBe(true);
    }
  });
});
