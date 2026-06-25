import { describe, expect, it } from "vite-plus/test";

import { Block } from "../../src/core";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("Block", () => {
  it("should renders a canonical wrapper with CSS-driven layout props", () => {
    const element = asElement(
      Block({
        maxWidth: "md",
        paddingX: "page",
        gap: "sm",
        children: "content",
      }),
    );

    expect(element.type).toBe("div");
    expect(element.props["data-slot"]).toBe("block");
    expect(element.props["data-ak-layout"]).toBe("true");
    expect(String(element.props.class)).toContain("ak-style-");
    expect(element.props.style).toBeUndefined();
  });

  it("should supports responsive layout props and asChild composition", () => {
    const responsive = asElement(
      Block({
        direction: { base: "column", lg: "row" },
        hide: { base: true, lg: false },
        children: "content",
      }),
    );
    const asChild = asElement(
      Block({
        asChild: true,
        width: "full",
        children: <section />,
      }),
    );

    expect(String(responsive.props.class)).toContain("ak-style-");
    expect(responsive.props["data-ak-layout"]).toBe("true");
    expect(asChild.props["data-ak-layout"]).toBe("true");
    expect(asChild.type).toBeDefined();
  });
});
