import { describe, expect, it } from "vite-plus/test";

import { AccessibleIcon } from "../src/components";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("AccessibleIcon", () => {
  it("renders a labeled icon wrapper with hidden text", () => {
    const element = asElement(
      AccessibleIcon({
        label: "Settings",
        children: <svg data-slot="icon" />,
      }),
    );

    expect(element.type).toBe("span");
    expect(element.props["data-slot"]).toBe("accessible-icon");
    expect(element.props["aria-label"]).toBe("Settings");
    expect(element.props["data-decorative"]).toBeUndefined();
  });

  it("defaults to decorative mode when no label is provided", () => {
    const element = asElement(AccessibleIcon({ children: <svg /> }));

    expect(element.props["aria-hidden"]).toBe("true");
    expect(element.props["data-decorative"]).toBe("true");
  });
});
