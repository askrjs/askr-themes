/**
 * Verify that every data-slot value emitted by askr-ui components
 * has corresponding CSS coverage in the default theme.
 *
 * Prefers a sibling askr-ui checkout, then falls back to the installed
 * @askrjs/ui package dist when a local source tree is not available.
 * Exit code 1 if uncovered or stale slots are found.
 */

import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const themesRoot = path.resolve(__dirname, "..");
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
const ALLOWED_THEME_ONLY_SLOTS = new Set(["center", "flex", "icon", "theme-provider"]);

function walkFiles(dirPath, extensions) {
  const normalizedExtensions = Array.isArray(extensions) ? extensions : [extensions];
  const results = [];
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

function resolveUiComponentsDir() {
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

function extractUiSlots() {
  const uiComponentsDir = resolveUiComponentsDir();

  if (!uiComponentsDir) {
    console.error(
      "askr-ui components not found.\n" +
        `Looked for ${UI_SOURCE_COMPONENTS_DIR}, ${UI_SOURCE_DIST_COMPONENTS_DIR}, and the installed @askrjs/ui package.`,
    );
    process.exit(1);
  }

  const slots = new Set();
  const files = walkFiles(uiComponentsDir, [".ts", ".tsx", ".js", ".cjs", ".mjs"]);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const patterns = [/['"]data-slot['"]\s*:\s*['"]([^'"]+)['"]/g, /data-slot="([^"]+)"/g];

    for (const pattern of patterns) {
      let match;
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
      let blockMatch;
      while ((blockMatch = blockPattern.exec(content))) {
        for (const valueMatch of blockMatch[1].matchAll(/:\s*['"]([^'"]+)['"](?:\s+as const)?/g)) {
          slots.add(valueMatch[1]);
        }
      }
    }
  }

  return slots;
}

function extractThemeSlots() {
  const slots = new Set();
  const files = walkFiles(THEMES_COMPONENTS_DIR, ".css");

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const pattern = /\[data-slot=['"]([^'"]+)['"]\]/g;
    let match;
    while ((match = pattern.exec(content))) {
      slots.add(match[1]);
    }
  }

  return slots;
}

function extractSourceSlots(dirPath) {
  if (!fs.existsSync(dirPath)) return new Set();

  const slots = new Set();
  const files = walkFiles(dirPath, [".ts", ".tsx"]);

  for (const file of files) {
    const content = fs.readFileSync(file, "utf-8");
    const patterns = [/['"]data-slot['"]\s*:\s*['"]([^'"]+)['"]/g, /data-slot="([^"]+)"/g];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(content))) {
        slots.add(match[1]);
      }
    }
  }

  return slots;
}

function run() {
  const uiSlots = extractUiSlots();
  const themeSlots = extractThemeSlots();
  const themeComponentSlots = extractSourceSlots(THEME_SOURCE_COMPONENTS_DIR);

  const uncovered = [...uiSlots].filter((s) => !themeSlots.has(s)).sort();
  const themeOnly = [...themeSlots]
    .filter(
      (s) => !uiSlots.has(s) && !themeComponentSlots.has(s) && !ALLOWED_THEME_ONLY_SLOTS.has(s),
    )
    .sort();

  console.log(`UI slots:    ${uiSlots.size}`);
  console.log(`Theme slots: ${themeSlots.size}`);
  console.log(`Uncovered:   ${uncovered.length}`);
  console.log(`Theme-only:  ${themeOnly.length}`);

  if (uncovered.length > 0) {
    console.log("\nUncovered slots (in askr-ui but not in theme):");
    for (const slot of uncovered) {
      console.log(`  - ${slot}`);
    }
  }

  if (themeOnly.length > 0) {
    console.log("\nTheme-only slots (in theme but not in askr-ui):");
    for (const slot of themeOnly) {
      console.log(`  - ${slot}`);
    }
  }

  if (uncovered.length > 0 || themeOnly.length > 0) {
    process.exitCode = 1;
  }
}

run();
