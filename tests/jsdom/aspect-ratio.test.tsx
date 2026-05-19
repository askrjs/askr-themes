import { describe, expect, it } from "vite-plus/test";

import { AspectRatio } from "../../src/layouts";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("AspectRatio", () => {
  it("renders a canonical wrapper with a generated ratio class", () => {
    const element = asElement(AspectRatio({ ratio: 16 / 9, children: "media" }));

    expect(element.type).toBe("div");
    expect(element.props["data-slot"]).toBe("aspect-ratio");
    expect(element.props.style).toBeUndefined();
    expect(String(element.props.class)).toContain("ak-style-");
  });

  it("supports asChild composition", () => {
    const element = asElement(
      AspectRatio({
        asChild: true,
        ratio: "4 / 3",
        children: <figure />,
      }),
    );

    expect(element.type).toBeDefined();
  });
});
