import { type Page, expect, test } from "./fixtures";

/** Fixed clock origin, and the point the timer test freezes time at. */
const CLOCK_ORIGIN = new Date("2024-01-01T00:00:00Z");
const CLOCK_PAUSED_AT = new Date(CLOCK_ORIGIN.getTime() + 60_000);

interface ClipboardRecorderWindow {
  __clipboardWrites: string[];
}

/**
 * Replaces `navigator.clipboard.writeText` with a recorder before the harness
 * page loads — the Playwright equivalent of the original `vi.stubGlobal`. A
 * real clipboard permission grant would not let the spec assert on the exact
 * argument, so the calls are collected in a page-global array instead.
 */
async function recordClipboardWrites(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const writes: string[] = [];
    (window as unknown as ClipboardRecorderWindow).__clipboardWrites = writes;
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: (text: string) => {
          writes.push(text);
          return Promise.resolve();
        },
      },
    });
  });
}

/** Removes the Clipboard API entirely, so the component takes its failure path. */
async function removeClipboard(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
  });
}

async function clipboardWrites(page: Page): Promise<string[]> {
  return page.evaluate(
    () => (window as unknown as ClipboardRecorderWindow).__clipboardWrites ?? [],
  );
}

test.describe("CopyButton", () => {
  test("should announce success and restore its idle state after copying", async ({
    render,
    page,
    root,
  }) => {
    await recordClipboardWrites(page);
    await render("default", { resetAfter: 1000 });

    const button = root.locator("button");
    await button.click();
    await expect.poll(async () => (await clipboardWrites(page)).length).toBe(1);
    expect(await clipboardWrites(page)).toEqual(["resource-123"]);
    await expect(root.locator('[data-slot="copy-button-status"]')).toHaveText(
      "Copied to clipboard.",
    );
    await expect(button).toHaveAttribute("data-state", "success");
    await expect(button).toHaveAttribute("data-state", "idle");
  });

  test("should announce failure when the Clipboard API is unavailable", async ({
    render,
    page,
    root,
  }) => {
    await removeClipboard(page);
    await render();

    const button = root.locator("button");
    await button.click();
    await expect(root.locator('[data-slot="copy-button-status"]')).toHaveText(
      "Could not copy to clipboard.",
    );
    await expect(button).toHaveAttribute("data-state", "error");
  });

  test("should refresh one lifetime-owned reset timer after a rapid second copy", async ({
    render,
    page,
    root,
  }) => {
    await recordClipboardWrites(page);
    // `install()` alone leaves the clock ticking with real time; `pauseAt()` is
    // what makes it the manually advanced clock `vi.useFakeTimers()` gave the
    // original. It runs after the mount so the SPA boot still sees time flow.
    await page.clock.install({ time: CLOCK_ORIGIN });
    await render("default", { resetAfter: 1000 });
    await page.clock.pauseAt(CLOCK_PAUSED_AT);

    const button = root.locator("button");
    // The original clicked the element programmatically to bypass hit testing.
    await button.evaluate((element: HTMLElement) => {
      element.click();
    });
    await expect(button).toHaveAttribute("data-state", "success");

    await page.clock.runFor(300);
    await button.evaluate((element: HTMLElement) => {
      element.click();
    });
    await expect.poll(async () => (await clipboardWrites(page)).length).toBe(2);
    await page.clock.runFor(700);

    expect(await clipboardWrites(page)).toHaveLength(2);
    await expect(button).toHaveAttribute("data-state", "success");

    await page.clock.runFor(300);
    await expect(button).toHaveAttribute("data-state", "idle");
  });
});
