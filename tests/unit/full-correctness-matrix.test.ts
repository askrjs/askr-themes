import { readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { THEME_FAMILY_AUDIT_SELECTORS } from "../fixtures/component-audit-matrix";
import { ROOT_DIR } from "./test-paths";

describe("full visual correctness matrix", () => {
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
    }
  });
});
