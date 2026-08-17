import { describe, expect, it } from "vite-plus/test";

import {
  applyBlockLayoutStyles,
  mergeLayoutStyles,
  splitBlockLayoutProps,
} from "../../src/components/_internal/block-layout";
import {
  mergeCssVar,
  serializeCssDeclarations,
  styleDeclarationsToClass,
} from "../../src/components/_internal/style";

describe("block layout helpers", () => {
  it("should serialize layout declarations with user overrides", () => {
    expect(
      mergeLayoutStyles(
        {
          "--ak-gap-base": "var(--ak-space-md)",
          "--ak-px-base": "var(--ak-layout-page-gutter)",
        },
        {
          "--ak-gap-base": "var(--ak-space-lg)",
          color: "red",
        },
      ),
    ).toBe("--ak-gap-base:var(--ak-space-lg);--ak-px-base:var(--ak-layout-page-gutter);color:red");
  });

  it("should split block layout props from passthrough props", () => {
    const { blockProps, rest } = splitBlockLayoutProps({
      paddingX: "page",
      maxWidth: "page",
      rowFrom: "lg",
      class: "chrome",
      title: "Layout chrome",
    });

    expect(blockProps).toEqual({
      paddingX: "page",
      maxWidth: "page",
      rowFrom: "lg",
    });
    expect(rest).toEqual({ class: "chrome", title: "Layout chrome" });
  });

  it("should map block layout props to responsive css custom properties", () => {
    const styles: Record<string, string | number> = {};

    applyBlockLayoutStyles(styles, {
      paddingX: "page",
      maxWidth: "page",
      wrap: { base: true, lg: false },
      grow: true,
      rowFrom: "lg",
      hide: { base: true, lg: false },
      background: "surface",
    });

    expect(styles["--ak-px-base"]).toBe("var(--ak-layout-page-gutter)");
    expect(styles["--ak-max-width-base"]).toBe("var(--ak-layout-content-max-width)");
    expect(styles["--ak-flex-wrap-base"]).toBe("wrap");
    expect(styles["--ak-flex-wrap-lg"]).toBe("nowrap");
    expect(styles["--ak-flex-grow-base"]).toBe(1);
    expect(styles["--ak-flex-direction-lg"]).toBe("row");
    expect(styles["--ak-display-base"]).toBe("none");
    expect(styles["--ak-display-lg"]).toBe("flex");
    expect(styles["--ak-background-base"]).toBe("var(--ak-color-surface)");
  });

  it("should emit explicit responsive resets and axis-aware screen sizes", () => {
    const styles: Record<string, string | number> = {};

    applyBlockLayoutStyles(styles, {
      width: { base: "screen", xl: "full" },
      height: { base: "screen" },
      center: { base: true, lg: false },
      borderTop: { base: true, xl: false },
    });

    expect(styles["--ak-width-base"]).toBe("100dvw");
    expect(styles["--ak-height-base"]).toBe("100dvh");
    expect(styles["--ak-align-items-base"]).toBe("center");
    expect(styles["--ak-justify-content-base"]).toBe("center");
    expect(styles["--ak-align-items-lg"]).toBe("stretch");
    expect(styles["--ak-justify-content-lg"]).toBe("flex-start");
    expect(styles["--ak-border-top-base"]).toContain("var(--ak-color-border-subtle)");
    expect(styles["--ak-border-top-xl"]).toBe("0");
  });

  it("should lets explicit direction override rowFrom", () => {
    const styles: Record<string, string | number> = {};

    applyBlockLayoutStyles(styles, {
      rowFrom: "lg",
      direction: { lg: "column" },
    });

    expect(styles["--ak-flex-direction-lg"]).toBe("column");
  });
});

describe("style helpers", () => {
  it("should append css custom properties to string and object styles", () => {
    expect(mergeCssVar("color:red", "--ak-test", "1rem")).toBe("color:red;--ak-test:1rem");
    expect(mergeCssVar({ backgroundColor: "red", opacity: 0.5 }, "--ak-test", "1rem")).toBe(
      "background-color:red;opacity:0.5;--ak-test:1rem",
    );
  });

  it("should omit declarations that can escape a generated stylesheet rule", () => {
    expect(
      serializeCssDeclarations({
        color: "red",
        background: "red}.pwned{display:block",
        content: '"</style><script>"',
        "--safe-token": "var(--ak-color-text)",
      }),
    ).toBe("color:red;--safe-token:var(--ak-color-text)");
  });

  it("should reject unsafe property names and malformed string declarations", () => {
    expect(serializeCssDeclarations({ "color;body{display:block}": "red", color: "blue" })).toBe(
      "color:blue",
    );
    expect(styleDeclarationsToClass("color:red}.pwned{display:block")).toBeUndefined();
    expect(styleDeclarationsToClass("color:red; background:var(--ak-color-surface)")).toMatch(
      /^ak-style-/,
    );
  });

  it("should preserve grid repeat and minmax functions in generated styles", () => {
    expect(
      serializeCssDeclarations({
        "--ak-grid-columns-md": "repeat(2, minmax(0, 1fr))",
      }),
    ).toBe("--ak-grid-columns-md:repeat(2, minmax(0, 1fr))");
  });

  it("should preserve safe declarations adjacent to unsafe string declarations", () => {
    expect(
      serializeCssDeclarations({ color: "red", background: 'url("javascript:alert(1)")' }),
    ).toBe("color:red");
  });
});
