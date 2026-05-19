import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import { DOCS_DIR, ROOT_DIR, THEMING_FILE } from "./test-paths";

const VISUAL_CHECK_FILE = join(ROOT_DIR, "visual-check.html");
const DOCS_README_FILE = join(DOCS_DIR, "README.md");
const DOCS_THEMING_FILE = join(DOCS_DIR, "theming.md");
const DOCS_OVERVIEW_FILE = join(DOCS_DIR, "askr-themes.md");

function read(path: string): string {
  return readFileSync(path, "utf8");
}

describe("visual quality contract", () => {
  const visualCheck = read(VISUAL_CHECK_FILE);
  const rootTheming = read(THEMING_FILE);
  const docsReadme = read(DOCS_README_FILE);
  const docsTheming = read(DOCS_THEMING_FILE);
  const docsOverview = read(DOCS_OVERVIEW_FILE);

  it("keeps the manual audit page broad enough for polish work", () => {
    const requiredAuditCopy = [
      "Component audit, one family at a time.",
      "Quality checklist",
      "Typography and status",
      "Resilience states",
      "Responsive composition",
      "Mobile stress",
      "Supporting primitives",
      "Overlays",
      "Light mode",
      "Dark mode",
    ] as const;

    for (const snippet of requiredAuditCopy) {
      expect(visualCheck).toContain(snippet);
    }

    expect(visualCheck).toContain("No clipped text");
    expect(visualCheck).toContain("Dense SaaS compositions");
    expect(visualCheck).toContain('data-theme="dark"');
  });

  it("documents the visual audit standard and responsive widths", () => {
    const requiredDocs = [
      "Visual Quality Standard",
      "visual-check.html",
      "`320`, `390`, `768`, `1024`, and desktop widths",
      "No clipped text",
      "Dark mode has equal",
      "Dense SaaS",
      "Template Sync",
    ] as const;

    for (const snippet of requiredDocs) {
      expect(rootTheming).toContain(snippet);
      expect(docsTheming).toContain(snippet);
    }

    expect(docsReadme).toContain("Visual quality");
    expect(docsReadme).toContain("visual-check.html");
    expect(docsOverview).toContain("product-app oriented");
    expect(docsOverview).toContain("Theming](./theming.md#visual-quality-standard)");
  });

  it("documents that default theme CSS and templates move together", () => {
    const requiredTemplateSync = [
      "src/themes/default/styles",
      "templates/theme/styles",
      "same change",
      "intentionally different",
      ":where(...)",
      "public `data-slot` hooks",
      "selector contract tests",
    ] as const;

    for (const snippet of requiredTemplateSync) {
      expect(docsTheming).toContain(snippet);
    }

    expect(rootTheming).toContain("Template Sync");
    expect(rootTheming).toContain("templates/theme/styles");
  });
});
