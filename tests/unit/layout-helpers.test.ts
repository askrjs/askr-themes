import { describe, expect, it } from "vite-plus/test";

import {
  applyBlockLayoutStyles,
  mergeLayoutStyles,
  splitBlockLayoutProps,
} from "../../src/components/_internal/block-layout";
import { mergeCssVar } from "../../src/components/_internal/style";

describe("block layout helpers", () => {
  it("should serializes layout declarations with user overrides", () => {
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

  it("should splits block layout props from passthrough props", () => {
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

  it("should maps block layout props to responsive css custom properties", () => {
    const styles: Record<string, string | number> = {};

    applyBlockLayoutStyles(styles, {
      paddingX: "page",
      maxWidth: "page",
      grow: true,
      rowFrom: "lg",
      hide: { base: true, lg: false },
      background: "surface",
    });

    expect(styles["--ak-px-base"]).toBe("var(--ak-layout-page-gutter)");
    expect(styles["--ak-max-width-base"]).toBe("var(--ak-layout-content-max-width)");
    expect(styles["--ak-flex-grow-base"]).toBe(1);
    expect(styles["--ak-flex-direction-lg"]).toBe("row");
    expect(styles["--ak-display-base"]).toBe("none");
    expect(styles["--ak-display-lg"]).toBe("flex");
    expect(styles["--ak-background-base"]).toBe("var(--ak-color-surface)");
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
  it("should appends css custom properties to string and object styles", () => {
    expect(mergeCssVar("color:red", "--ak-test", "1rem")).toBe("color:red;--ak-test:1rem");
    expect(mergeCssVar({ backgroundColor: "red", opacity: 0.5 }, "--ak-test", "1rem")).toBe(
      "background-color:red;opacity:0.5;--ak-test:1rem",
    );
  });
});
