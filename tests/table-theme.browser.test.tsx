import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@askrjs/ui";

import "../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("table theme smoke test", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/table");
    clearRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
  });

  it("styles the semantic table primitives through the default theme bundle", async () => {
    route("/table", () => (
      <Table aria-label="Users">
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const table = container?.querySelector('[data-slot="table"]') as HTMLTableElement | null;
    const headerCell = container?.querySelector(
      '[data-slot="table-header-cell"]',
    ) as HTMLTableCellElement | null;
    const bodyCell = container?.querySelector(
      '[data-slot="table-cell"]',
    ) as HTMLTableCellElement | null;

    expect(table?.getAttribute("data-slot")).toBe("table");
    expect(headerCell?.getAttribute("data-slot")).toBe("table-header-cell");
    expect(bodyCell?.getAttribute("data-slot")).toBe("table-cell");
    expect(getComputedStyle(table!).borderRadius).not.toBe("0px");
    expect(getComputedStyle(bodyCell!).paddingInlineStart).not.toBe("0px");
  });
});
