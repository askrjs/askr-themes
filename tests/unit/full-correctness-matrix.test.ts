import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
  DIMENSION_EVIDENCE,
  REQUIRED_COMPOSITION_SLOTS,
  THEME_FAMILY_AUDIT_SELECTORS,
} from "../fixtures/component-audit-matrix";
import { ROOT_DIR } from "./test-paths";

describe("full visual correctness matrix", () => {
  const auditPage = readFileSync(join(ROOT_DIR, "visual-check.html"), "utf8");

  it("should map every public theme family to a rendered audit selector", () => {
    const actual = readdirSync(join(ROOT_DIR, "src", "components"), { withFileTypes: true })
      .filter(
        (entry) => entry.isDirectory() && entry.name !== "_internal" && entry.name !== "overlays",
      )
      .map((entry) => entry.name)
      .sort();
    expect(Object.keys(THEME_FAMILY_AUDIT_SELECTORS).sort()).toEqual(actual);

    for (const [family, selector] of Object.entries(THEME_FAMILY_AUDIT_SELECTORS)) {
      const slot = selector.match(/data-slot="([^"]+)"/)?.[1];
      expect(slot, family).toBeDefined();
      expect(auditPage, `${family} is missing ${selector}`).toContain(`data-slot="${slot}"`);
    }
  });

  it("should attach every correctness dimension to executable browser evidence", () => {
    for (const [dimension, [file, contract]] of Object.entries(DIMENSION_EVIDENCE)) {
      const source = readFileSync(join(ROOT_DIR, file), "utf8");
      expect(source, `${dimension} is missing executable evidence`).toContain(contract);
    }
  });

  it("should render integration-only slots in the permanent audit page", () => {
    for (const slot of REQUIRED_COMPOSITION_SLOTS) {
      expect(auditPage, `visual-check.html is missing ${slot}`).toContain(`data-slot="${slot}"`);
    }
  });
});
