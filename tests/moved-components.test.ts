import { describe, expect, it } from "vite-plus/test";

import {
  Badge,
  Box,
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
    expect(Flex({ children: "cluster", gap: "2", wrap: "wrap" })).toBeTruthy();
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
    expect(custom.props["data-max-width"]).toBeUndefined();
    expect(String(custom.props.style)).toContain("--ak-max-width-initial:68rem");
  });

  it("avoids inline styles for CSS-covered layout defaults", () => {
    const box = asElement(Box({ children: "box" }));
    const paddedBox = asElement(Box({ children: "box", p: "2" }));
    const flex = asElement(Flex({ children: "flex" }));
    const tokenFlex = asElement(Flex({ children: "flex", gap: "sm", direction: "column" }));
    const section = asElement(Section({ children: "section" }));
    const spacer = asElement(Spacer({}));
    const inlineSpacer = asElement(Spacer({ axis: "inline" }));
    const sidebarLayout = asElement(SidebarLayout({ sidebar: "nav", children: "main" }));
    const topbarLayout = asElement(TopbarLayout({ topbar: "header", children: "main" }));

    expect(box.props.style).toBeUndefined();
  expect(paddedBox.props["data-p"]).toBeUndefined();
  expect(String(paddedBox.props.style)).toContain("--ak-p-initial:var(--ak-space-2)");
    expect(flex.props.style).toBeUndefined();
    expect(tokenFlex.props.style).toBeUndefined();
  expect(tokenFlex.props["data-gap"]).toBe("initial:sm");
    expect(section.props["data-size"]).toBe("initial:3");
    expect(section.props.style).toBeUndefined();
    expect(spacer.props.style).toBeUndefined();
    expect(inlineSpacer.props.style).toBeUndefined();
    expect(sidebarLayout.props.style).toBeUndefined();
    expect(topbarLayout.props.style).toBeUndefined();
  });

  it("keeps inline styles for uncovered flex and grid overrides", () => {
    const responsiveFlex = asElement(
      Flex({ children: "flex", gap: { initial: "sm", md: "lg" } })
    );
    const customFlex = asElement(Flex({ children: "flex", gap: "1.5rem" }));
    const customSidebarLayout = asElement(
      SidebarLayout({ sidebar: "nav", children: "main", sidebarWidth: "18rem", gap: "1.5rem" })
    );

    expect(String(responsiveFlex.props.style)).toContain("--ak-gap-initial:var(--ak-space-sm)");
    expect(responsiveFlex.props["data-gap"]).toBeUndefined();
    expect(customFlex.props["data-gap"]).toBeUndefined();
    expect(String(customFlex.props.style)).toContain("--ak-gap-initial:1.5rem");
    expect(customSidebarLayout.props["data-sidebar-width"]).toBeUndefined();
    expect(customSidebarLayout.props["data-gap"]).toBeUndefined();
  });

  it("keeps inline styles only for explicit spacer overrides", () => {
    const flexBasisSpacer = asElement(Spacer({ basis: "1rem" }));
    const widthSpacer = asElement(Spacer({ axis: "inline", basis: "2rem" }));
    const growSpacer = asElement(Spacer({ grow: 2 }));

    expect(String(flexBasisSpacer.props.style)).toContain("flex-basis:1rem");
    expect(String(widthSpacer.props.style)).toContain("width:2rem");
    expect(String(growSpacer.props.style)).toContain("flex-grow:2");
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
