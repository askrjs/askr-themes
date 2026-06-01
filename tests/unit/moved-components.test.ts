import { describe, expect, it } from "vite-plus/test";

import { Block, Box, Container, Flex, Inline, Section, Spacer, Stack } from "../../src/layouts";
import { Badge, Divider, Separator, Skeleton } from "../../src/surfaces";
import { Shell, ShellMain, ShellNav } from "../../src/shells";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("moved visual components", () => {
  it("should exposes layout and composition primitives from themes", () => {
    expect(Box({ children: "box", p: "2" })).toBeTruthy();
    expect(Block({ children: "block", gap: "2" })).toBeTruthy();
    expect(Flex({ children: "flex", gap: "2" })).toBeTruthy();
    expect(Inline({ children: "inline", gap: "2" })).toBeTruthy();
    expect(Stack({ children: "stack", gap: "2" })).toBeTruthy();
    expect(Flex({ children: "cluster", gap: "2", wrap: "wrap" })).toBeTruthy();
    expect(Container({ children: "container", size: "2" })).toBeTruthy();
    expect(Section({ children: "section", size: "2" })).toBeTruthy();
    expect(Spacer({ basis: "1rem" })).toBeTruthy();
  });

  it("should keeps default and fluid container sizes on data attributes", () => {
    const constrained = asElement(Container({ children: "container" }));
    const fluid = asElement(Container({ children: "container", size: "fluid" }));

    expect(constrained.props["data-slot"]).toBe("container");
    expect(constrained.props["data-variant"]).toBe("default");
    expect(constrained.props.style).toBeUndefined();
    expect(fluid.props["data-variant"]).toBeUndefined();
    expect(fluid.props["data-size"]).toBe("initial:fluid");
    expect(fluid.props.style).toBeUndefined();
  });

  it("should supports bootstrap-like responsive container variants", () => {
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

  it("should uses generated classes for explicit width overrides", () => {
    const fixed = asElement(Container({ children: "container", size: "lg" }));
    const custom = asElement(Container({ children: "container", maxWidth: "68rem" }));

    expect(fixed.props["data-size"]).toBe("initial:lg");
    expect(fixed.props.style).toBeUndefined();
    expect(custom.props["data-max-width"]).toBeUndefined();
    expect(custom.props.style).toBeUndefined();
    expect(String(custom.props.class)).toContain("ak-style-");
  });

  it("should keeps CSS-covered layout defaults off the style attribute", () => {
    const box = asElement(Box({ children: "box" }));
    const block = asElement(Block({ children: "block", gap: "sm", size: "md" }));
    const paddedBox = asElement(Box({ children: "box", p: "2" }));
    const flex = asElement(Flex({ children: "flex" }));
    const tokenFlex = asElement(Flex({ children: "flex", gap: "sm", direction: "column" }));
    const section = asElement(Section({ children: "section" }));
    const spacer = asElement(Spacer({}));
    const inlineSpacer = asElement(Spacer({ axis: "inline" }));
    const shell = asElement(Shell({ variant: "sidebar", gap: "sm", children: "shell" }));
    const topbarShell = asElement(
      Shell({
        variant: "topbar",
        children: [ShellNav({ children: "header" }), ShellMain({ children: "main" })],
      }),
    );

    expect(box.props.style).toBeUndefined();
    expect(block.props["data-gap"]).toBe("initial:sm");
    expect(block.props["data-size"]).toBe("initial:md");
    expect(paddedBox.props["data-p"]).toBeUndefined();
    expect(paddedBox.props.style).toBeUndefined();
    expect(String(paddedBox.props.class)).toContain("ak-style-");
    expect(flex.props.style).toBeUndefined();
    expect(tokenFlex.props.style).toBeUndefined();
    expect(tokenFlex.props["data-gap"]).toBe("initial:sm");
    expect(section.props["data-size"]).toBe("initial:3");
    expect(section.props.style).toBeUndefined();
    expect(spacer.props.style).toBeUndefined();
    expect(inlineSpacer.props.style).toBeUndefined();
    expect(shell.props["data-variant"]).toBe("sidebar");
    expect(shell.props.style).toBeUndefined();
    expect(topbarShell.props["data-variant"]).toBe("topbar");
    expect(topbarShell.props.style).toBeUndefined();
  });

  it("should uses generated classes for uncovered flex overrides", () => {
    const responsiveFlex = asElement(Flex({ children: "flex", gap: { initial: "sm", md: "lg" } }));
    const customFlex = asElement(Flex({ children: "flex", gap: "1.5rem" }));

    expect(responsiveFlex.props.style).toBeUndefined();
    expect(String(responsiveFlex.props.class)).toContain("ak-style-");
    expect(responsiveFlex.props["data-gap"]).toBeUndefined();
    expect(customFlex.props["data-gap"]).toBeUndefined();
    expect(customFlex.props.style).toBeUndefined();
    expect(String(customFlex.props.class)).toContain("ak-style-");
  });

  it("should uses generated classes for explicit spacer overrides", () => {
    const flexBasisSpacer = asElement(Spacer({ basis: "1rem" }));
    const widthSpacer = asElement(Spacer({ axis: "inline", basis: "2rem" }));
    const growSpacer = asElement(Spacer({ grow: 2 }));

    expect(flexBasisSpacer.props.style).toBeUndefined();
    expect(widthSpacer.props.style).toBeUndefined();
    expect(growSpacer.props.style).toBeUndefined();
    expect(String(flexBasisSpacer.props.class)).toContain("ak-style-");
    expect(String(widthSpacer.props.class)).toContain("ak-style-");
    expect(String(growSpacer.props.class)).toContain("ak-style-");
  });

  it("should exposes visual display primitives and divider aliases", () => {
    expect(Badge({ children: "new", variant: "secondary" })).toBeTruthy();
    expect(Skeleton({})).toBeTruthy();
    expect(Separator({ orientation: "vertical" })).toBeTruthy();
    expect(Divider({ decorative: true })).toBeTruthy();
  });

  it("should keeps layout patterns in themes", () => {
    expect(Shell({ variant: "sidebar", children: "main" })).toBeTruthy();
    expect(
      Shell({
        variant: "topbar",
        children: [ShellNav({ children: "header" }), ShellMain({ children: "main" })],
      }),
    ).toBeTruthy();
  });
});
