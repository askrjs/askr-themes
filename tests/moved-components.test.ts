import { describe, expect, it } from "vite-plus/test";

import {
  Badge,
  Box,
  Cluster,
  Container,
  Divider,
  Flex,
  Grid,
  Inline,
  Section,
  Separator,
  SidebarLayout,
  Skeleton,
  Spacer,
  Stack,
  TopbarLayout,
} from "../src/components";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("moved visual components", () => {
  it("exposes layout and composition primitives from themes", () => {
    expect(Box({ children: "box", p: "2" })).toBeTruthy();
    expect(Flex({ children: "flex", gap: "2" })).toBeTruthy();
    expect(Inline({ children: "inline", gap: "2" })).toBeTruthy();
    expect(Stack({ children: "stack", gap: "2" })).toBeTruthy();
    expect(Cluster({ children: "cluster", gap: "2" })).toBeTruthy();
    expect(typeof Grid).toBe("function");
    expect(Container({ children: "container", size: "2" })).toBeTruthy();
    expect(Section({ children: "section", size: "2" })).toBeTruthy();
    expect(Spacer({ basis: "1rem" })).toBeTruthy();
  });

  it("keeps default and fluid containers on data attributes instead of inline styles", () => {
    const constrained = asElement(Container({ children: "container" }));
    const fluid = asElement(Container({ children: "container", fluid: true }));

    expect(constrained.props["data-slot"]).toBe("container");
    expect(constrained.props.style).toBeUndefined();
    expect(fluid.props["data-fluid"]).toBe("true");
    expect(fluid.props.style).toBeUndefined();
  });

  it("falls back to inline styles only for explicit width overrides", () => {
    const fixed = asElement(Container({ children: "container", size: "lg" }));
    const custom = asElement(Container({ children: "container", maxWidth: "68rem" }));

    expect(fixed.props["data-size"]).toBe("initial:lg");
    expect(fixed.props.style).toBeUndefined();
    expect(custom.props["data-max-width"]).toBe("initial:68rem");
    expect(String(custom.props.style)).toContain("--ak-max-width-initial:68rem");
  });

  it("exposes visual display primitives and divider aliases", () => {
    expect(Badge({ children: "new", variant: "secondary" })).toBeTruthy();
    expect(Skeleton({})).toBeTruthy();
    expect(Separator({ orientation: "vertical" })).toBeTruthy();
    expect(Divider({ decorative: true })).toBeTruthy();
  });

  it("keeps layout patterns in themes", () => {
    expect(SidebarLayout({ sidebar: "nav", children: "main" })).toBeTruthy();
    expect(TopbarLayout({ topbar: "header", children: "main" })).toBeTruthy();
  });
});
