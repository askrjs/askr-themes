import { expect, test } from "./fixtures";

const REQUIRED_SLOTS = [
  "page",
  "header",
  "page-header",
  "meta-strip",
  "toolbar",
  "section",
  "main",
  "aside",
  "sidebar",
  "button",
  "button-group",
  "input-group",
  "field",
  "field-hint",
  "field-error",
  "aspect-ratio",
  "card",
  "alert",
  "badge",
  "separator",
  "skeleton",
  "empty-state",
  "progress-circle",
];

const BLOCK_INITIAL_PROPERTIES = [
  "flexDirection",
  "flexWrap",
  "justifyContent",
  "gap",
  "flexGrow",
  "flexShrink",
  "minWidth",
  "maxWidth",
  "boxSizing",
  "position",
  "borderTopStyle",
  "borderTopWidth",
  "borderRadius",
  "boxShadow",
];

test.describe("public family browser smoke", () => {
  test("should render the remaining public families in a browser mount", async ({
    render,
    root,
  }) => {
    await render("families");

    const missingSlots = await root.evaluate(
      (container, slots) =>
        slots.filter((slot) => !container.querySelector(`[data-slot="${slot}"]`)),
      REQUIRED_SLOTS,
    );
    expect(missingSlots).toEqual([]);

    const styles = await root.evaluate((container) => {
      const px = (value: string): number => Number.parseFloat(value.replace("px", ""));
      const layoutBlocks = [
        ...container.querySelectorAll('[data-ak-layout="true"][class*="ak-style-"]'),
      ] as HTMLElement[];
      const read = (selector: string): CSSStyleDeclaration =>
        getComputedStyle(container.querySelector(selector) as HTMLElement);

      const inlineMeta = container.querySelector('[data-testid="inline-meta"]') as HTMLElement;
      const stackedMeta = container.querySelector('[data-testid="stacked-meta"]') as HTMLElement;

      return {
        layoutBlockCount: layoutBlocks.length,
        anyLayoutBlockIsFlex: layoutBlocks.some(
          (block) => getComputedStyle(block).display === "flex",
        ),
        anyLayoutBlockHasGap: layoutBlocks.some((block) => {
          const style = getComputedStyle(block);
          return px(style.rowGap) > 0 || px(style.columnGap) > 0;
        }),
        headerPosition: read('[data-slot="header"]').position,
        sidebarBorderRightWidth: read('[data-slot="sidebar"]').borderRightWidth,
        aspectRatio: read('[data-slot="aspect-ratio"]').aspectRatio,
        pageHeaderCopyFlexDirection: read('[data-slot="page-header-copy"]').flexDirection,
        pageHeaderFlexDirection: read('[data-slot="page-header"]').flexDirection,
        expectedPageHeaderFlexDirection: window.matchMedia("(min-width: 48rem)").matches
          ? "row"
          : "column",
        emptyStateContentFlexDirection: read('[data-slot="empty-state-content"]').flexDirection,
        inlineMetaTagName: inlineMeta.tagName,
        inlineMetaTermCount: inlineMeta.querySelectorAll(":scope > div > dt").length,
        inlineMetaDefinitionCount: inlineMeta.querySelectorAll(":scope > div > dd").length,
        inlineMetaFlexWrap: getComputedStyle(inlineMeta).flexWrap,
        stackedMetaFlexDirection: getComputedStyle(stackedMeta).flexDirection,
        stackedMetaScrollWidth: stackedMeta.scrollWidth,
        stackedMetaClientWidth: stackedMeta.clientWidth,
      };
    });

    expect(styles.layoutBlockCount).toBeGreaterThan(0);
    expect(styles.anyLayoutBlockIsFlex).toBe(true);
    expect(styles.anyLayoutBlockHasGap).toBe(true);
    expect(styles.headerPosition).toBe("sticky");
    expect(styles.sidebarBorderRightWidth).not.toBe("0px");
    expect(styles.aspectRatio).not.toBe("auto");
    expect(styles.pageHeaderCopyFlexDirection).toBe("column");
    expect(styles.pageHeaderFlexDirection).toBe(styles.expectedPageHeaderFlexDirection);
    expect(styles.emptyStateContentFlexDirection).toBe("column");
    expect(styles.inlineMetaTagName).toBe("DL");
    expect(styles.inlineMetaTermCount).toBe(2);
    expect(styles.inlineMetaDefinitionCount).toBe(2);
    expect(styles.inlineMetaFlexWrap).toBe("wrap");
    expect(styles.stackedMetaFlexDirection).toBe("column");
    expect(styles.stackedMetaScrollWidth).toBeLessThanOrEqual(styles.stackedMetaClientWidth);
  });

  test("should keep attached input groups on one row in constrained toolbar actions", async ({
    render,
    root,
  }) => {
    await render("constrainedToolbar");

    const group = root.locator('[data-slot="input-group"]');
    const prefix = root.locator('[data-slot="input-group-text"]');
    const input = root.locator('[data-slot="input"]');

    await expect(group).toHaveCount(1);
    await expect(prefix).toHaveCount(1);
    await expect(input).toHaveCount(1);
    await expect(group).toHaveCSS("flex-wrap", "nowrap");

    const prefixBox = (await prefix.boundingBox())!;
    const inputBox = (await input.boundingBox())!;
    expect(Math.abs(prefixBox.y - inputBox.y)).toBeLessThan(1);
  });

  test("should preserve native CSS initials for Block properties omitted by the caller", async ({
    render,
    root,
  }) => {
    await render("partialBlock");

    const result = await root.evaluate((container, properties) => {
      const block = container.querySelector(".partial-block") as HTMLElement;
      const control = container.querySelector(".partial-control") as HTMLElement;
      const blockStyle = getComputedStyle(block);
      const controlStyle = getComputedStyle(control);

      return {
        display: blockStyle.display,
        alignItems: blockStyle.alignItems,
        comparisons: properties.map((property) => ({
          property,
          block: blockStyle[property as keyof CSSStyleDeclaration] as string,
          control: controlStyle[property as keyof CSSStyleDeclaration] as string,
        })),
      };
    }, BLOCK_INITIAL_PROPERTIES);

    expect(result.display).toBe("flex");
    expect(result.alignItems).toBe("flex-start");

    for (const { property, block, control } of result.comparisons) {
      expect({ property, value: block }).toEqual({ property, value: control });
    }
  });
});
