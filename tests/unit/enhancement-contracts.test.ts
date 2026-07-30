import { describe, expect, it } from "vite-plus/test";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { CardTitle } from "../../src/components/card/card";
import {
  serializeCssDeclarations,
  styleDeclarationsToClass,
} from "../../src/components/_internal/style";
import {
  DEFAULT_THEME_INDEX_FILE,
  DEFAULT_THEME_STYLES_DIR,
  TEMPLATE_THEME_INDEX_FILE,
  TEMPLATE_THEME_STYLES_DIR,
} from "./test-paths";

describe("catalog and composition contracts", () => {
  it("should render correct heading levels given card title options when semantic levels vary", () => {
    expect(CardTitle({ titleAs: "h2", children: "Section" }).type).toBe("h2");
    expect(CardTitle({ titleAs: "h4", children: "Detail" }).type).toBe("h4");
  });

  it("should preserve slot names and generated classes given nested catalog composition when children change", () => {
    const title = CardTitle({ children: "Stable", class: "consumer-title" });
    expect(title.props["data-slot"]).toBe("card-title");
    expect(title.props.class).toContain("card-title");
    expect(title.props.class).toContain("consumer-title");
  });

  it("should render deterministic catalog markup given identical props when components remount", () => {
    expect(CardTitle({ titleAs: "h3", children: "Same" })).toEqual(
      CardTitle({ titleAs: "h3", children: "Same" }),
    );
  });
});

describe("responsive, template, and CSS safety contracts", () => {
  it("should preserve layout invariants given each breakpoint when the default theme is generated", () => {
    const css = readFileSync(join(DEFAULT_THEME_STYLES_DIR, "layout/layout.css"), "utf8");
    for (const breakpoint of ["40rem", "48rem", "64rem", "80rem"]) {
      expect(css).toContain(`@media (min-width: ${breakpoint})`);
    }
  });

  it("should preserve template parity given every official preset when component CSS and token CSS are generated", () => {
    const files = (root: string) =>
      readdirSync(root, { withFileTypes: true }).flatMap((entry) =>
        entry.isDirectory()
          ? files(join(root, entry.name)).map((file) => join(entry.name, file))
          : entry.name.endsWith(".css")
            ? [entry.name]
            : [],
      );
    expect(files(DEFAULT_THEME_STYLES_DIR).sort()).toEqual(files(TEMPLATE_THEME_STYLES_DIR).sort());
  });

  it("should reject unsafe or unscoped custom-property injection given consumer style overrides when generated theme rules are serialized", () => {
    expect(styleDeclarationsToClass("--safe-token:var(--ak-color-text)")).toMatch(/^ak-style-/);
    const generated = serializeCssDeclarations({ "--unsafe": "red; } .pwned { color: red" });
    expect(generated).not.toContain("}");
    expect(styleDeclarationsToClass(generated)).toBeUndefined();
  });

  it("should preserve canonical token aliases given default and template entrypoints when the same component stylesheet is imported", () => {
    const defaultIndex = readFileSync(DEFAULT_THEME_INDEX_FILE, "utf8");
    const templateIndex = readFileSync(TEMPLATE_THEME_INDEX_FILE, "utf8");
    expect(templateIndex).toBe(defaultIndex);
  });

  it("should keep generated CSS scoped to approved selectors given component and theme sources when the package is built", () => {
    const css = readFileSync(join(DEFAULT_THEME_STYLES_DIR, "display/card.css"), "utf8");
    expect(css).toContain(':where(.card, [data-slot="card"])');
    expect(css).not.toMatch(/(^|\n)\s*body\b/);
  });
});
