import { expect, test } from "../browser/fixtures";
import { THEME_FAMILY_AUDIT_SELECTORS } from "../fixtures/component-audit-matrix";

test("should preserve real controls and layered overlays in emulated forced colors", async ({
  render,
  page,
  root,
}) => {
  await render();
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);

  await page.keyboard.press("Tab");
  const focusedButton = root.locator('[data-slot="button"]');
  await expect(focusedButton).toBeFocused();
  await expect(focusedButton).not.toHaveCSS("outline-style", "none");

  const disabled = root.locator('[aria-label="Disabled field"]');
  await expect(disabled).not.toHaveCSS("border-style", "none");
  expect(
    Number.parseFloat(
      await disabled.evaluate((element) => getComputedStyle(element).borderTopWidth),
    ),
  ).toBeGreaterThanOrEqual(1);

  await page.getByRole("button", { name: "Open layers" }).click();
  const dialog = page.locator('[data-slot="dialog-content"]');
  await expect(dialog).toBeVisible();
  expect(
    Number.parseFloat(await dialog.evaluate((element) => getComputedStyle(element).borderTopWidth)),
  ).toBeGreaterThanOrEqual(2);

  await page.getByRole("button", { name: "Open popover" }).click();
  const popover = page.locator('[data-slot="popover-content"]');
  await expect(popover).toBeVisible();
  expect(
    Number.parseFloat(
      await popover.evaluate((element) => getComputedStyle(element).borderTopWidth),
    ),
  ).toBeGreaterThanOrEqual(2);
  await page.getByRole("button", { name: "Close popover" }).click();
  await expect(popover).toHaveCount(0);

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.keyboard.press("Home");
  const item = page.locator('[data-slot="dropdown-item"]').first();
  await expect(item).not.toHaveCSS("outline-style", "none");
});

test("should preserve virtual-table focus, hierarchy, and selection in emulated forced colors", async ({
  markup,
  page,
  root,
}) => {
  await markup(`
    <div data-slot="virtual-table">
      <table data-slot="virtual-table-table" role="grid" tabindex="0">
        <thead data-slot="virtual-table-head">
          <tr data-slot="virtual-table-header-row">
            <th data-slot="virtual-table-header-cell">Service</th>
          </tr>
        </thead>
        <tbody data-slot="virtual-table-body">
          <tr data-slot="virtual-table-row" data-selected="true">
            <td data-slot="virtual-table-cell">
              <div data-slot="virtual-table-cell-content"><span>router</span></div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `);
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);

  const table = root.locator('[data-slot="virtual-table"]');
  const focusTarget = root.locator('[data-slot="virtual-table-table"]');
  const tableHead = root.locator('[data-slot="virtual-table-head"]');
  const selectedRow = root.locator('[data-slot="virtual-table-row"][data-selected="true"]');

  await page.keyboard.press("Tab");
  await expect(focusTarget).toBeFocused();
  await expect(table).not.toHaveCSS("outline-style", "none");
  await expect(table).not.toHaveCSS("border-top-style", "none");
  await expect(tableHead).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(selectedRow).not.toHaveCSS("outline-style", "none");
  await expect(selectedRow).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("should keep every public theme family perceptible in emulated forced colors", async ({
  markup,
  page,
  root,
}) => {
  const slots = Object.entries(THEME_FAMILY_AUDIT_SELECTORS).map(([family, selector]) => {
    const slot = /data-slot="([^"]+)"/u.exec(selector)?.[1];
    if (!slot) throw new Error(`Audit selector for "${family}" has no data-slot: ${selector}`);
    return { family, slot };
  });

  await markup(
    slots
      .map(({ family, slot }) => `<div data-slot="${slot}" tabindex="0">${family}</div>`)
      .join(""),
  );
  expect(await page.evaluate(() => matchMedia("(forced-colors: active)").matches)).toBe(true);

  // Each entry carries its slot so a failure names the family, the way the
  // original per-assertion message did.
  const measured = await root.evaluate((element) =>
    [...element.children].map((child) => {
      (child as HTMLElement).focus();
      const style = getComputedStyle(child);
      return {
        slot: (child as HTMLElement).dataset.slot,
        transparentColor: style.color === "rgba(0, 0, 0, 0)",
        outlineless: style.outlineStyle === "none",
      };
    }),
  );

  expect(measured).toEqual(
    slots.map(({ slot }) => ({ slot, transparentColor: false, outlineless: false })),
  );
});
