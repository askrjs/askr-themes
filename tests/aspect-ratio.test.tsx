import { describe, expect, it } from "vite-plus/test";

import { AspectRatio } from "../src/components";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("AspectRatio", () => {
  it("renders a canonical wrapper with a responsive ratio style", () => {
    const element = asElement(AspectRatio({ ratio: 16 / 9, children: "media" }));

    expect(element.type).toBe("div");
    expect(element.props["data-slot"]).toBe("aspect-ratio");
    expect(String(element.props.style)).toContain("aspect-ratio:1.7777777777777777");
    expect(String(element.props.style)).toContain("width:100%");
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
