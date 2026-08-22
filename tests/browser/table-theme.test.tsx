import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFoot,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../src/surfaces";

import "../../src/themes/default/index.css";

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
    resetTestRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    resetTestRoutes();
  });

  it("should style the semantic table primitives through the default theme bundle", async () => {
    testRoute("/table", () => (
      <Table aria-label="Users">
        <TableCaption>Current users</TableCaption>
        <TableHead>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow data-state="selected">
            <TableCell>Alice</TableCell>
            <TableCell>alice@example.com</TableCell>
          </TableRow>
        </TableBody>
        <TableFoot>
          <TableRow>
            <TableCell>Total</TableCell>
            <TableCell>1 user</TableCell>
          </TableRow>
        </TableFoot>
      </Table>
    ));

    await createSPA({ root: container!, registry: createTestRegistry() });
    await settle();

    const table = container?.querySelector('[data-slot="table"]') as HTMLTableElement | null;
    const headerCell = container?.querySelector(
      '[data-slot="table-header-cell"]',
    ) as HTMLTableCellElement | null;
    const bodyCell = container?.querySelector(
      '[data-slot="table-cell"]',
    ) as HTMLTableCellElement | null;
    const caption = container?.querySelector(
      '[data-slot="table-caption"]',
    ) as HTMLTableCaptionElement | null;
    const selectedRow = container?.querySelector(
      '[data-slot="table-row"][data-state="selected"]',
    ) as HTMLTableRowElement | null;
    const footer = container?.querySelector(
      '[data-slot="table-foot"]',
    ) as HTMLTableSectionElement | null;

    expect(table?.getAttribute("data-slot")).toBe("table");
    expect(headerCell?.getAttribute("data-slot")).toBe("table-header-cell");
    expect(bodyCell?.getAttribute("data-slot")).toBe("table-cell");
    expect(getComputedStyle(table!).borderCollapse).toBe("collapse");
    expect(getComputedStyle(table!).tableLayout).toBe("auto");
    expect(getComputedStyle(caption!).captionSide).toBe("bottom");
    expect(getComputedStyle(headerCell!).verticalAlign).toBe("middle");
    expect(getComputedStyle(headerCell!).whiteSpace).toBe("normal");
    expect(getComputedStyle(bodyCell!).verticalAlign).toBe("middle");
    expect(getComputedStyle(selectedRow!).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(footer!).fontWeight).not.toBe("400");
    expect(getComputedStyle(bodyCell!).paddingInlineStart).not.toBe("0px");
  });
});
