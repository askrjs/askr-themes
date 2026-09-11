import { expect, test } from "./fixtures";

function columnCount(value: string): number {
  return value.split(/\s+/u).filter(Boolean).length;
}

test.describe("responsive and visual theme contracts", () => {
  test("should preserve layout invariants given responsive components when crossing breakpoints", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await render("responsiveLayout");

    const block = root.locator(".responsive-block");
    const grid = root.locator(".responsive-grid");
    const content = root.locator(".responsive-container");
    const section = root.locator(".responsive-section");
    const toolbar = root.locator('[data-slot="toolbar"]');
    const pageHeader = root.locator('[data-slot="page-header"]');

    const mobilePadding = Number.parseFloat(
      await content.evaluate((element) => getComputedStyle(element).paddingInlineStart),
    );
    const mobileSectionPadding = Number.parseFloat(
      await section.evaluate((element) => getComputedStyle(element).paddingBlockStart),
    );

    await expect(block).toHaveCSS("flex-direction", "column");
    await expect(section).toHaveCSS("flex-direction", "column");
    await expect(toolbar).toHaveCSS("flex-direction", "column");
    await expect(pageHeader).toHaveCSS("flex-direction", "column");
    expect(
      columnCount(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns)),
    ).toBe(1);

    const overflow = await content.evaluate((element) => {
      const contentRight = element.getBoundingClientRect().right;
      return {
        scrollWidth: element.scrollWidth,
        clientWidth: element.clientWidth,
        overflowDetails: [element, ...element.querySelectorAll<HTMLElement>("*")]
          .map((node) => ({
            slot: node.getAttribute("data-slot") ?? node.tagName.toLowerCase(),
            clientWidth: node.clientWidth,
            scrollWidth: node.scrollWidth,
            right: Math.round(node.getBoundingClientRect().right),
          }))
          .filter((entry) => entry.scrollWidth > entry.clientWidth || entry.right > contentRight),
      };
    });
    // `overflowDetails` rides along in the assertion so a failure still names the
    // slot that overflowed, the way the original failure message did.
    expect({
      overflowing: overflow.scrollWidth > overflow.clientWidth,
      scrollWidth: overflow.scrollWidth,
      clientWidth: overflow.clientWidth,
      overflowDetails: overflow.overflowDetails,
    }).toEqual({
      overflowing: false,
      scrollWidth: overflow.scrollWidth,
      clientWidth: overflow.clientWidth,
      overflowDetails: overflow.overflowDetails,
    });

    await page.setViewportSize({ width: 1024, height: 900 });

    await expect(block).toHaveCSS("flex-direction", "row");
    await expect(toolbar).toHaveCSS("flex-direction", "row");
    await expect(pageHeader).toHaveCSS("flex-direction", "row");
    await expect
      .poll(async () =>
        columnCount(
          await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns),
        ),
      )
      .toBe(3);
    expect(
      Number.parseFloat(
        await content.evaluate((element) => getComputedStyle(element).paddingInlineStart),
      ),
    ).toBeGreaterThan(mobilePadding);
    expect(
      Number.parseFloat(
        await section.evaluate((element) => getComputedStyle(element).paddingBlockStart),
      ),
    ).toBeGreaterThan(mobileSectionPadding);
  });

  test("should let Page content occupy the available container width", async ({ render, root }) => {
    await render("pageWidth");

    const pageContainer = root.locator('[data-slot="container"]');
    const pageContent = pageContainer.locator('[data-slot="block"]').first();
    const grid = root.locator(".page-grid");

    const widths = await pageContainer.evaluate((element) => ({
      container: element.getBoundingClientRect().width,
      content: element.querySelector<HTMLElement>('[data-slot="block"]')!.getBoundingClientRect()
        .width,
    }));
    await expect(pageContent).toBeVisible();

    expect(widths.content).toBeGreaterThan(widths.container * 0.8);
    expect((await grid.boundingBox())!.width).toBeGreaterThan(0);
    expect(
      columnCount(await grid.evaluate((element) => getComputedStyle(element).gridTemplateColumns)),
    ).toBe(2);
  });

  test("should let nested Blocks shrink inside a constrained row", async ({ render, root }) => {
    await render("blockShrink");

    const row = root.locator(".constrained-row");
    const shrinkingChild = root.locator(".shrinking-child");
    const explicitAuto = root.locator(".explicit-auto");

    await expect(shrinkingChild).toHaveCSS("min-width", "0px");
    const rights = await row.evaluate((element) => ({
      row: element.getBoundingClientRect().right,
      child: element.querySelector<HTMLElement>(".shrinking-child")!.getBoundingClientRect().right,
    }));
    expect(rights.child).toBeLessThanOrEqual(rights.row);
    await expect(explicitAuto).toHaveCSS("min-width", "auto");
  });

  test("should keep form control states readable in the default theme", async ({
    render,
    root,
  }) => {
    await render("formStates");

    const styles = await root.evaluate((element) => {
      const read = (label: string): HTMLInputElement =>
        element.querySelector<HTMLInputElement>(`[aria-label="${label}"]`)!;
      const invalid = read("Invalid field");
      const disabled = read("Disabled field");
      const readonly = read("Readonly field");
      const placeholder = read("Placeholder field");
      return {
        invalidBorderColor: getComputedStyle(invalid).borderColor,
        disabledOpacity: getComputedStyle(disabled).opacity,
        disabledPointerEvents: getComputedStyle(disabled).pointerEvents,
        readonlyBorderColor: getComputedStyle(readonly).borderColor,
        readonlyColor: getComputedStyle(readonly).color,
        readonlyOpacity: getComputedStyle(readonly).opacity,
        placeholderColor: getComputedStyle(placeholder, "::placeholder").color,
      };
    });

    expect(styles.invalidBorderColor).not.toBe(styles.readonlyBorderColor);
    expect(styles.disabledOpacity).toBe("1");
    expect(styles.disabledPointerEvents).toBe("none");
    expect(styles.readonlyColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(styles.readonlyOpacity).toBe("1");
    expect(styles.placeholderColor).not.toBe("rgba(0, 0, 0, 0)");
  });

  test("should preserve table readability with long content at narrow widths", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await render("narrowTable");

    const wrapper = root.locator(".table-width");
    const table = root.locator('[data-slot="table"]');
    const heading = root.locator('[data-slot="table-header-cell"]').first();
    const cell = root.locator('[data-slot="table-cell"]').first();

    await expect(table).toHaveCSS("table-layout", "auto");
    await expect(wrapper).toHaveCSS("overflow-x", "auto");
    await expect(heading).toHaveCSS("white-space", "normal");
    await expect(cell).toHaveCSS("white-space", "normal");
  });

  test("should layer and focus a dropdown opened from a dialog inside a sidebar", async ({
    render,
    page,
    root,
  }) => {
    await render("nestedOverlays");

    await root.locator('[aria-haspopup="dialog"]').click();

    const dialog = page.locator('[data-slot="dialog-content"]');
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-slot="dropdown-trigger"]').click();

    const menu = page.locator('[data-slot="dropdown-content"][aria-label="Dialog actions"]');
    await expect(menu).toHaveCount(1);

    const layers = await menu.evaluate((element) => ({
      menuZIndex: Number.parseInt(getComputedStyle(element).zIndex, 10),
      dialogZIndex: Number.parseInt(
        getComputedStyle(document.querySelector<HTMLElement>('[data-slot="dialog-content"]')!)
          .zIndex,
        10,
      ),
      holdsFocus: element === document.activeElement || element.contains(document.activeElement),
    }));

    expect(layers.menuZIndex).toBeGreaterThan(layers.dialogZIndex);
    expect(layers.holdsFocus).toBe(true);
  });

  test("should preserve intent layout geometry without narrow viewport overflow", async ({
    render,
    page,
    root,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await render("intentLayouts");

    const geometry = await root.evaluate((element) => {
      const stack = element.querySelector<HTMLElement>('[data-test="stack"]')!;
      const cluster = element.querySelector<HTMLElement>('[data-test="cluster"]')!;
      const center = element.querySelector<HTMLElement>('[data-test="center"]')!;
      const clusterChildren = [...cluster.children] as HTMLElement[];
      const centerBounds = center.getBoundingClientRect();
      const centeredChild = center.firstElementChild!.getBoundingClientRect();
      return {
        stackScrollWidth: stack.scrollWidth,
        stackClientWidth: stack.clientWidth,
        firstChildTop: clusterChildren[0]!.getBoundingClientRect().top,
        secondChildTop: clusterChildren[1]!.getBoundingClientRect().top,
        horizontalOffset: Math.abs(
          centeredChild.left +
            centeredChild.width / 2 -
            (centerBounds.left + centerBounds.width / 2),
        ),
        verticalOffset: Math.abs(
          centeredChild.top +
            centeredChild.height / 2 -
            (centerBounds.top + centerBounds.height / 2),
        ),
      };
    });

    expect(geometry.stackScrollWidth).toBeLessThanOrEqual(geometry.stackClientWidth);
    expect(geometry.secondChildTop).toBeGreaterThan(geometry.firstChildTop);
    expect(geometry.horizontalOffset).toBeLessThanOrEqual(1);
    expect(geometry.verticalOffset).toBeLessThanOrEqual(1);
  });
});
