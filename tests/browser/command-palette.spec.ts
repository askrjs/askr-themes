import { expect, test } from "./fixtures";

test.describe("CommandPalette", () => {
  test("should wire dialog semantics, contain focus, and restore the trigger", async ({
    render,
    page,
    root,
  }) => {
    await render("dialogSemantics");

    const trigger = root.locator("button").first();
    await trigger.click();

    // The dialog is portaled outside `#mount-root`.
    const dialog = page.locator('[role="dialog"]');
    const input = dialog.locator("input").first();
    const link = dialog.locator("a").first();

    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog).toHaveAttribute("aria-labelledby", /\S/u);
    await expect(dialog).toHaveAttribute("aria-describedby", /\S/u);
    await expect(link).not.toHaveAttribute("role");
    expect(
      await link.evaluate((element) => [
        element.parentElement?.tagName,
        element.parentElement?.parentElement?.tagName,
      ]),
    ).toEqual(["LI", "UL"]);
    await expect(input).toBeFocused();

    // The focus scope handles real Tab keydowns, so the synthetic
    // `KeyboardEvent` dispatches of the original are unnecessary here.
    await page.keyboard.press("Shift+Tab");
    await expect(link).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(input).toBeFocused();

    await page.keyboard.press("Escape");

    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();

    const restoredTrigger = root.locator("button").first();
    await restoredTrigger.focus();
    await restoredTrigger.click();
    await expect(dialog.locator("input").first()).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(restoredTrigger).toBeFocused();
  });

  test("should focus and restore the active element for programmatic opens", async ({
    render,
    page,
    root,
    run,
  }) => {
    await render("programmaticOpen");

    const outside = root.locator("button").first();
    await outside.focus();
    await run("setOpen", true);

    const input = page.locator('[role="dialog"] input').first();
    await expect(input).toBeFocused();

    await run("setOpen", false);

    await expect(outside).toBeFocused();
  });

  test("should allow Escape and backdrop dismissal to be disabled explicitly", async ({
    render,
    page,
  }) => {
    await render("dismissalDisabled");

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(1);

    const overlay = page.locator("[data-command-palette-overlay]");
    // The overlay sits under the palette content, so the outside-interaction is
    // dispatched rather than driven through a real pointer.
    await overlay.evaluate((element) => {
      element.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
    });
    await expect(dialog).toHaveCount(1);
  });

  test("should keep the palette inside narrow mobile and desktop viewports", async ({
    render,
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await render("viewportBounds");

    const content = page.locator("[data-command-palette-content]");
    await expect(content).toBeVisible();

    const readRect = async () =>
      content.evaluate((element) => {
        const { left, right, top, bottom, width } = element.getBoundingClientRect();
        return { slot: "command-palette-content", left, right, top, bottom, width };
      });

    const mobileRect = await readRect();
    expect(mobileRect.left).toBeGreaterThanOrEqual(8);
    expect(mobileRect.right).toBeLessThanOrEqual(382);
    expect(mobileRect.top).toBeGreaterThanOrEqual(8);
    expect(mobileRect.bottom).toBeLessThanOrEqual(836);

    await page.setViewportSize({ width: 1280, height: 900 });
    const desktopRect = await readRect();
    expect(desktopRect.width).toBeLessThanOrEqual(672);
    expect(desktopRect.right).toBeLessThanOrEqual(1272);
    expect(desktopRect.bottom).toBeLessThanOrEqual(892);
  });

  test("should run cleanup and close before same-origin result navigation", async ({
    render,
    page,
    root,
    run,
  }) => {
    await render("cleanupBeforeNavigate");

    await root.locator("button").first().click();

    const link = page.locator('[data-slot="command-item"]').first();
    await expect(link).toBeVisible();
    await link.click();

    await expect.poll(() => run<string[]>("events")).toEqual(["open", "cleanup", "close"]);
    expect(await run<boolean>("targetObservedClosed")).toBe(true);
    expect(new URL(page.url()).pathname).toBe("/guide");
    await expect(root).toContainText("Guide");
  });

  test("should let onBeforeNavigate cancel navigation and palette dismissal", async ({
    render,
    page,
    run,
  }) => {
    await render("cancelNavigate");

    const link = page.locator('[data-slot="command-item"]').first();
    await expect(link).toBeVisible();
    await link.click();

    await expect.poll(() => run<number>("calls")).toBe(1);
    expect(new URL(page.url()).pathname).toBe("/docs");
    await expect(page.locator('[role="dialog"]')).toHaveCount(1);
  });
});
