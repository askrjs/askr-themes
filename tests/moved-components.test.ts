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
    expect(constrained.props["data-variant"]).toBe("default");
    expect(constrained.props.style).toBeUndefined();
    expect(fluid.props["data-variant"]).toBe("fluid");
    expect(fluid.props["data-fluid"]).toBe("true");
    expect(fluid.props.style).toBeUndefined();
  });

  it("supports bootstrap-like responsive container variants", () => {
    const containerSm = asElement(Container({ children: "container", variant: "sm" }));
    const containerMd = asElement(Container({ children: "container", variant: "md" }));
    const containerLg = asElement(Container({ children: "container", variant: "lg" }));
    const containerXl = asElement(Container({ children: "container", variant: "xl" }));
    const containerXxl = asElement(Container({ children: "container", variant: "xxl" }));

    expect(containerSm.props["data-variant"]).toBe("sm");
    expect(containerMd.props["data-variant"]).toBe("md");
    expect(containerLg.props["data-variant"]).toBe("lg");
    expect(containerXl.props["data-variant"]).toBe("xl");
    expect(containerXxl.props["data-variant"]).toBe("xxl");
    expect(containerSm.props.style).toBeUndefined();
    expect(containerXxl.props.style).toBeUndefined();
  });

  it("falls back to inline styles only for explicit width overrides", () => {
    const fixed = asElement(Container({ children: "container", size: "lg" }));
    const custom = asElement(Container({ children: "container", maxWidth: "68rem" }));

    expect(fixed.props["data-size"]).toBe("initial:lg");
    expect(fixed.props.style).toBeUndefined();
    expect(custom.props["data-max-width"]).toBe("initial:68rem");
    expect(String(custom.props.style)).toContain("--ak-max-width-initial:68rem");
  });

  it("avoids inline styles for CSS-covered layout defaults", () => {
    const box = asElement(Box({ children: "box" }));
    const flex = asElement(Flex({ children: "flex" }));
    const sidebarLayout = asElement(SidebarLayout({ sidebar: "nav", children: "main" }));
    const topbarLayout = asElement(TopbarLayout({ topbar: "header", children: "main" }));

    expect(box.props.style).toBeUndefined();
    expect(flex.props.style).toBeUndefined();
    expect(sidebarLayout.props.style).toBeUndefined();
    expect(topbarLayout.props.style).toBeUndefined();
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
