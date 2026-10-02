import { expect, test } from "./fixtures";

for (const direction of ["ltr", "rtl"] as const) {
  for (const labels of [
    ["Production workspaces", "Deployment history", "Settings"],
    ["Home", "Admin", "A very long current page title that must truncate"],
    ["ProductionWorkspacesWithoutSpaces", "DeploymentHistoryWithoutSpaces", "Settings"],
  ]) {
    test(`breadcrumb stays bounded in ${direction}: ${labels.join(" / ")}`, async ({
      page,
      markup,
    }) => {
      await page.setViewportSize({ width: 320, height: 600 });
      await markup(`
        <nav data-slot="breadcrumb" dir="${direction}" style="width: 288px; margin: 16px">
          <ol data-slot="breadcrumb-list">
            <li data-slot="breadcrumb-item"><a data-slot="breadcrumb-link" href="#">${labels[0]}</a></li>
            <li data-slot="breadcrumb-separator" aria-hidden="true">/</li>
            <li data-slot="breadcrumb-item"><a data-slot="breadcrumb-link" href="#">${labels[1]}</a></li>
            <li data-slot="breadcrumb-separator" aria-hidden="true">/</li>
            <li data-slot="breadcrumb-item"><span data-slot="breadcrumb-page" aria-current="page">${labels[2]}</span></li>
          </ol>
        </nav>
      `);
      const geometry = await page.locator('[data-slot="breadcrumb-list"]').evaluate((list) => {
        const bounds = list.getBoundingClientRect();
        const children = [...list.children].map((child) => child.getBoundingClientRect());
        const current = list.querySelector<HTMLElement>('[aria-current="page"]')!;
        const style = getComputedStyle(current);
        return {
          documentWidth: document.documentElement.scrollWidth,
          containerWidth: list.clientWidth,
          contentWidth: list.scrollWidth,
          bounded: children.every(
            (box) => box.left >= bounds.left - 1 && box.right <= bounds.right + 1,
          ),
          oneLine: children.every(
            (box) => box.top < children[0]!.bottom && box.bottom > children[0]!.top,
          ),
          currentTextWidth:
            current.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
          ellipsis: style.textOverflow,
        };
      });
      expect(geometry.documentWidth).toBeLessThanOrEqual(320);
      expect(geometry.contentWidth).toBeLessThanOrEqual(geometry.containerWidth);
      expect(geometry.bounded).toBe(true);
      expect(geometry.oneLine).toBe(true);
      expect(geometry.currentTextWidth).toBeGreaterThan(24);
      expect(geometry.ellipsis).toBe("ellipsis");
    });
  }
}
