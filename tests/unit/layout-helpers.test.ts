import { describe, expect, it } from "vite-plus/test";

import {
  applyBoxLayoutStyles,
  splitBoxLayoutProps,
} from "../../src/components/_internal/box-layout";
import {
  mergeLayoutStyles,
  resolveAlignValue,
  resolveContainerSizeValue,
  resolveJustifyValue,
  resolveSectionSizeValue,
  resolveSpaceValue,
} from "../../src/components/_internal/layout";
import { mergeCssVar } from "../../src/components/_internal/style";

describe("layout helpers", () => {
  it("serializes layout declarations with user overrides", () => {
    expect(
      mergeLayoutStyles(
        {
          display: "grid",
          gap: "var(--ak-space-2)",
        },
        {
          gap: "var(--ak-space-4)",
          padding: "1rem",
        },
      ),
    ).toBe("display:grid;gap:var(--ak-space-4);padding:1rem");

    expect(mergeLayoutStyles({ display: "grid" }, "gap:1rem;justify-content:center")).toBe(
      "display:grid;gap:1rem;justify-content:center",
    );
  });

  it("splits box layout props from passthrough props", () => {
    const { boxProps, rest } = splitBoxLayoutProps({
      display: "flex",
      m: "sm",
      maxWidth: "68rem",
      class: "shell",
      title: "Layout shell",
    });

    expect(boxProps).toEqual({ display: "flex", m: "sm", maxWidth: "68rem" });
    expect(rest).toEqual({ class: "shell", title: "Layout shell" });
  });

  it("maps box layout props to css custom properties", () => {
    const styles: Record<string, string | number> = {};

    applyBoxLayoutStyles(styles, {
      m: "sm",
      maxWidth: "68rem",
      flexGrow: 2,
    });

    expect(styles["--ak-m-initial"]).toBe("var(--ak-space-sm)");
    expect(styles["--ak-max-width-initial"]).toBe("68rem");
    expect(styles["--ak-flex-grow-initial"]).toBe(2);
  });

  it("resolves the canonical layout size helpers", () => {
    expect(resolveSpaceValue("sm")).toBe("var(--ak-space-sm)");
    expect(resolveSpaceValue(12)).toBe("12");
    expect(resolveContainerSizeValue("lg")).toBe("var(--ak-container-3)");
    expect(resolveContainerSizeValue("fluid")).toBe("100%");
    expect(resolveSectionSizeValue("3")).toBe("var(--ak-section-3)");
    expect(resolveJustifyValue("between")).toBe("space-between");
    expect(resolveJustifyValue("end")).toBe("flex-end");
    expect(resolveAlignValue("start")).toBe("flex-start");
    expect(resolveAlignValue("center")).toBe("center");
  });
});

describe("style helpers", () => {
  it("appends css custom properties to string and object styles", () => {
    expect(mergeCssVar("color:red", "--ak-test", "1rem")).toBe("color:red;--ak-test:1rem");
    expect(mergeCssVar({ backgroundColor: "red", opacity: 0.5 }, "--ak-test", "1rem")).toBe(
      "background-color:red;opacity:0.5;--ak-test:1rem",
    );
  });
});
