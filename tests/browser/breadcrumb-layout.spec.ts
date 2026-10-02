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

test("breadcrumb icon crumbs keep spacing between the icon and the label", async ({
  page,
  markup,
}) => {
  await page.setViewportSize({ width: 375, height: 600 });
  await markup(`
    <nav data-slot="breadcrumb" style="width: 343px; margin: 16px">
      <ol data-slot="breadcrumb-list">
        <li data-slot="breadcrumb-item"><a data-slot="breadcrumb-link" href="#"><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7"/></svg>Home</a></li>
        <li data-slot="breadcrumb-separator" aria-hidden="true">/</li>
        <li data-slot="breadcrumb-item"><span data-slot="breadcrumb-page" aria-current="page"><svg width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="7"/></svg>Settings</span></li>
      </ol>
    </nav>
  `);
  const gaps = await page
    .locator('[data-slot="breadcrumb-link"], [data-slot="breadcrumb-page"]')
    .evaluateAll((nodes) =>
      nodes.map((node) => {
        const icon = node.querySelector("svg")!.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(node.lastChild!);
        const text = range.getBoundingClientRect();
        return text.left - icon.right;
      }),
    );
  for (const gap of gaps) expect(gap).toBeGreaterThanOrEqual(3);
});

test("breadcrumb keeps ancestors readable with four crumbs at 320px", async ({ page, markup }) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await markup(`
    <nav data-slot="breadcrumb" style="width: 288px; margin: 16px">
      <ol data-slot="breadcrumb-list">
        <li data-slot="breadcrumb-item"><a data-slot="breadcrumb-link" href="#">Production workspaces</a></li>
        <li data-slot="breadcrumb-separator" aria-hidden="true">/</li>
        <li data-slot="breadcrumb-item"><a data-slot="breadcrumb-link" href="#">Deployment history</a></li>
        <li data-slot="breadcrumb-separator" aria-hidden="true">/</li>
        <li data-slot="breadcrumb-item"><a data-slot="breadcrumb-link" href="#">Release candidates</a></li>
        <li data-slot="breadcrumb-separator" aria-hidden="true">/</li>
        <li data-slot="breadcrumb-item"><span data-slot="breadcrumb-page" aria-current="page">Settings</span></li>
      </ol>
    </nav>
  `);
  const geometry = await page.locator('[data-slot="breadcrumb-list"]').evaluate((list) => {
    const widths = [...list.querySelectorAll<HTMLElement>('[data-slot="breadcrumb-link"]')].map(
      (link) => {
        const style = getComputedStyle(link);
        return link.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
      },
    );
    return {
      narrowestAncestorText: Math.min(...widths),
      overflow: list.scrollWidth - list.clientWidth,
    };
  });
  expect(geometry.narrowestAncestorText).toBeGreaterThanOrEqual(24);
  expect(geometry.overflow).toBeLessThanOrEqual(0);
});

test("breadcrumb does not cap a trailing ellipsis as the current page", async ({
  page,
  markup,
}) => {
  await page.setViewportSize({ width: 320, height: 600 });
  await markup(`
    <nav data-slot="breadcrumb" style="width: 288px; margin: 16px">
      <ol data-slot="breadcrumb-list">
        <li data-slot="breadcrumb-item"><span data-slot="breadcrumb-page" aria-current="page">Settings</span></li>
        <li data-slot="breadcrumb-item" id="trailing"><span data-slot="breadcrumb-ellipsis">…</span></li>
      </ol>
    </nav>
  `);
  const trailing = await page
    .locator("#trailing")
    .evaluate((node) => getComputedStyle(node).maxInlineSize);
  expect(trailing).toBe("none");
});
