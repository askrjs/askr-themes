import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import {
  AUDITED_THEME_FAMILIES,
  AUDIT_DIMENSIONS,
  REQUIRED_COMPOSITION_SLOTS,
} from "../fixtures/component-audit-matrix";
import { ROOT_DIR } from "./test-paths";

describe("full visual correctness matrix", () => {
  const auditPage = readFileSync(join(ROOT_DIR, "visual-check.html"), "utf8");

  it("should account for every public theme component family", () => {
    const actual = readdirSync(join(ROOT_DIR, "src", "components"), { withFileTypes: true })
      .filter(
        (entry) => entry.isDirectory() && entry.name !== "_internal" && entry.name !== "overlays",
      )
      .map((entry) => entry.name)
      .sort();
    expect([...AUDITED_THEME_FAMILIES].sort()).toEqual(actual);
  });

  it("should make the complete permutation contract explicit", () => {
    expect(AUDIT_DIMENSIONS).toHaveLength(10);
  });

  it("should render integration-only slots in the permanent audit page", () => {
    for (const slot of REQUIRED_COMPOSITION_SLOTS) {
      expect(auditPage, `visual-check.html is missing ${slot}`).toContain(`data-slot="${slot}"`);
    }
  });
});
