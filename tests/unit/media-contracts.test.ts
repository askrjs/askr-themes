import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import { ROOT_DIR } from "./test-paths";

const SOURCE = "src/themes/default/styles/base/accessibility.css";
const TEMPLATE = "templates/theme/styles/base/accessibility.css";

describe("high-contrast and print media contracts", () => {
  it("should keep form and tabular print rules in source/template parity", () => {
    const source = readFileSync(join(ROOT_DIR, SOURCE), "utf8");
    const template = readFileSync(join(ROOT_DIR, TEMPLATE), "utf8");
    expect(template).toBe(source);
    expect(source).toContain("@media print");
    for (const slot of [
      "input",
      "textarea",
      "select-trigger",
      "native-select",
      "field",
      "table",
      "table-row",
      "data-table",
    ]) {
      expect(source, slot).toContain(`[data-slot="${slot}"]`);
    }
    expect(source).toContain("break-inside: avoid");
    expect(source).toContain("box-shadow: none");
  });
});
