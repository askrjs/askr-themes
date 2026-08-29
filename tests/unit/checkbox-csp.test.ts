import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

const ROOT_DIR = process.cwd();
const SOURCE_CHECKBOX = join(ROOT_DIR, "src/themes/default/styles/forms/checkbox.css");
const TEMPLATE_CHECKBOX = join(ROOT_DIR, "templates/theme/styles/forms/checkbox.css");

describe("checkbox CSP contract", () => {
  it("should keep source and generated-template indicators resource-free", () => {
    const source = readFileSync(SOURCE_CHECKBOX, "utf8");
    const template = readFileSync(TEMPLATE_CHECKBOX, "utf8");

    expect(source).toEqual(template);
    expect(source).not.toMatch(/url\s*\(\s*["']?data:/iu);
    expect(source).toContain('data-state="checked"');
    expect(source).toContain('data-state="indeterminate"');
  });
});
