import { expect, test } from "./fixtures";

test.describe("table theme browser behavior", () => {
  test("should style the semantic table primitives through the default theme bundle", async ({
    render,
    root,
  }) => {
    await render();

    const table = root.locator('[data-slot="table"]');
    const headerCell = root.locator('[data-slot="table-header-cell"]').first();
    const bodyCell = root.locator('[data-slot="table-cell"]').first();
    const caption = root.locator('[data-slot="table-caption"]');
    const selectedRow = root.locator('[data-slot="table-row"][data-state="selected"]');
    const footer = root.locator('[data-slot="table-foot"]');

    await expect(table).toHaveAttribute("data-slot", "table");
    await expect(headerCell).toHaveAttribute("data-slot", "table-header-cell");
    await expect(bodyCell).toHaveAttribute("data-slot", "table-cell");
    await expect(table).toHaveCSS("border-collapse", "collapse");
    await expect(table).toHaveCSS("table-layout", "auto");
    await expect(caption).toHaveCSS("caption-side", "bottom");
    await expect(headerCell).toHaveCSS("vertical-align", "middle");
    await expect(headerCell).toHaveCSS("white-space", "normal");
    await expect(bodyCell).toHaveCSS("vertical-align", "middle");
    await expect(selectedRow).not.toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(footer).not.toHaveCSS("font-weight", "400");
    await expect(bodyCell).not.toHaveCSS("padding-inline-start", "0px");
  });
});
