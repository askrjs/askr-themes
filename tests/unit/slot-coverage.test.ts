/**
 * Verify that every data-slot value emitted by askr-ui components
 * has corresponding CSS coverage in the default theme.
 */

import { describe, expect, it } from "vite-plus/test";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const themesRoot = path.resolve(__dirname, "..", "..");
const require = createRequire(import.meta.url);

const UI_SOURCE_COMPONENTS_DIR = path.resolve(themesRoot, "..", "askr-ui", "src", "components");
const UI_SOURCE_DIST_COMPONENTS_DIR = path.resolve(
  themesRoot,
  "..",
  "askr-ui",
  "dist",
  "components",
);
const THEME_SOURCE_COMPONENTS_DIR = path.join(themesRoot, "src", "components");
const THEMES_COMPONENTS_DIR = path.join(themesRoot, "src", "themes", "default", "styles");

const ALLOWED_THEME_ONLY_SLOTS = new Set([
  "block",
  "calendar-day",
  "center",
  "flex",
  "icon",
  "pill",
  "pills",
  "sidebar-content",
  "sidebar-footer",
  "sidebar-group",
  "sidebar-group-content",
  "sidebar-group-label",
  "sidebar-header",
  "sidebar-inset",
  "sidebar-menu",
  "sidebar-menu-badge",
  "sidebar-menu-item",
  "sidebar-scope",
  "sidebar-rail",
  "tab",
  "tabs",
  "theme-scope",
  "toast-icon",
]);

const ALLOWED_UNCOVERED_UI_SLOTS = new Set([
  "collapsible",
  "collapsible-content",
  "collapsible-trigger",
  "form",
  "menu-content",
  "menu-group",
  "menu-item",
  "menu-label",
  "menu-separator",
  "navigation-menu",
  "navigation-menu-content",
  "navigation-menu-indicator",
  "navigation-menu-link",
  "navigation-menu-list",
  "navigation-menu-sub-trigger",
  "navigation-menu-trigger",
  "navigation-menu-viewport",
  "radio-group",
  "radio-group-item",
]);

function walkFiles(dirPath: string, extensions: string[] | string): string[] {
  const normalizedExtensions = Array.isArray(extensions) ? extensions : [extensions];
  const results: string[] = [];

  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      results.push(...walkFiles(fullPath, extensions));
    } else if (normalizedExtensions.some((extension) => entry.name.endsWith(extension))) {
      results.push(fullPath);
    }
  }

  return results;
}

function resolveUiComponentsDir(): string | null {
  if (fs.existsSync(UI_SOURCE_COMPONENTS_DIR)) {
    return UI_SOURCE_COMPONENTS_DIR;
  }

  if (fs.existsSync(UI_SOURCE_DIST_COMPONENTS_DIR)) {
    return UI_SOURCE_DIST_COMPONENTS_DIR;
  }

  try {
    const packageJsonPath = require.resolve("@askrjs/ui/package.json");
    const installedComponentsDir = path.join(path.dirname(packageJsonPath), "dist", "components");

    if (fs.existsSync(installedComponentsDir)) {
      return installedComponentsDir;
    }
  } catch {
    // Ignore resolution failures and report a single consolidated error below.
  }

  return null;
}

function extractUiSlots(): Set<string> {
  const uiComponentsDir = resolveUiComponentsDir();

  if (!uiComponentsDir) {
    throw new Error(
      "askr-ui components not found. Looked for " +
        `${UI_SOURCE_COMPONENTS_DIR}, ${UI_SOURCE_DIST_COMPONENTS_DIR}, and the installed @askrjs/ui package.`,
    );
  }

  const slots = new Set<string>();
  const files = walkFiles(uiComponentsDir, [".ts", ".tsx", ".js", ".cjs", ".mjs"]);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const patterns = [/['"]data-slot['"]\s*:\s*['"]([^'"]+)['"]/g, /data-slot="([^"]+)"/g];

    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content))) {
        slots.add(match[1]);
      }
    }

    const slotBlockPatterns = [
      /SLOTS\s*:\s*\{([\s\S]*?)\n\s*\}(?:\s*,|\s*as const)?/g,
      /const\s+SLOTS\s*=\s*\{([\s\S]*?)\n\s*\}(?:\s*as const)?/g,
      /const\s+[A-Z0-9_]*SLOTS\s*=\s*\{([\s\S]*?)\n\s*\}(?:\s*as const)?/g,
    ];

    for (const blockPattern of slotBlockPatterns) {
      let blockMatch: RegExpExecArray | null;
      while ((blockMatch = blockPattern.exec(content))) {
        for (const valueMatch of blockMatch[1].matchAll(/:\s*['"]([^'"]+)['"](?:\s+as const)?/g)) {
          slots.add(valueMatch[1]);
        }
      }
    }
  }

  return slots;
}

function extractThemeSlots(): Set<string> {
  const slots = new Set<string>();
  const files = walkFiles(THEMES_COMPONENTS_DIR, ".css");

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const pattern = /\[data-slot=['"]([^'"]+)['"]\]/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(content))) {
      slots.add(match[1]);
    }
  }

  return slots;
}

function extractSourceSlots(dirPath: string): Set<string> {
  if (!fs.existsSync(dirPath)) return new Set();

  const slots = new Set<string>();
  const files = walkFiles(dirPath, [".ts", ".tsx"]);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const patterns = [
      /['"]data-slot['"]\s*:\s*['"]([^'"]+)['"]/g,
      /data-slot="([^"]+)"/g,
      /\bslot\s*:\s*['"]([^'"]+)['"]/g,
      /buttonPart\([\s\S]*?,\s*['"]([^'"]+)['"]/g,
    ];

    for (const pattern of patterns) {
      let match: RegExpExecArray | null;
      while ((match = pattern.exec(content))) {
        slots.add(match[1]);
      }
    }
  }

  return slots;
}

describe("slot coverage", () => {
  const uiSlots = extractUiSlots();
  const themeSlots = extractThemeSlots();
  const themeComponentSlots = extractSourceSlots(THEME_SOURCE_COMPONENTS_DIR);

  it("should finds slots in askr-ui and the default theme", () => {
    expect(uiSlots.size).toBeGreaterThan(0);
    expect(themeSlots.size).toBeGreaterThan(0);
  });

  it("should covers every askr-ui slot in the default theme CSS", () => {
    const uncovered = [...uiSlots]
      .filter((slot) => !themeSlots.has(slot) && !ALLOWED_UNCOVERED_UI_SLOTS.has(slot))
      .sort();

    expect(
      uncovered,
      `Uncovered slots (in askr-ui but not in theme): ${uncovered.join(", ")}`,
    ).toEqual([]);
  });

  it("should does not leave stale theme-only slots", () => {
    const themeOnly = [...themeSlots]
      .filter(
        (slot) =>
          !uiSlots.has(slot) &&
          !themeComponentSlots.has(slot) &&
          !ALLOWED_THEME_ONLY_SLOTS.has(slot),
      )
      .sort();

    expect(
      themeOnly,
      `Theme-only slots (in theme but not in askr-ui): ${themeOnly.join(", ")}`,
    ).toEqual([]);
  });
});
