import { describe, expect, it } from "vite-plus/test";

import { Block } from "../../src/layouts";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("Block", () => {
  it("renders a canonical wrapper with CSS-driven block sizing", () => {
    const element = asElement(Block({ size: "md", children: "content" }));

    expect(element.type).toBe("div");
    expect(element.props["data-slot"]).toBe("block");
    expect(element.props["data-size"]).toBe("initial:md");
    expect(element.props.style).toBeUndefined();
  });

  it("keeps CSS-covered spacing on data attributes and supports asChild composition", () => {
    const spaced = asElement(Block({ gap: "sm", children: "content" }));
    const asChild = asElement(
      Block({
        asChild: true,
        size: "sm",
        children: <section />,
      }),
    );

    expect(spaced.props["data-gap"]).toBe("initial:sm");
    expect(asChild.type).toBeDefined();
  });
});
