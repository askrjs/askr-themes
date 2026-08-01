import { page } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { cleanupApp, createSPA } from "@askrjs/askr/boot";

import { Block, Container, Grid, Section, Sidebar } from "../../src/core";
import { Input } from "../../src/controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
} from "../../src/overlays";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
} from "../../src/surfaces";
import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

function columnCount(value: string): number {
  return value.split(/\s+/).filter(Boolean).length;
}

describe("responsive and visual theme contracts", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    resetTestRoutes();
  });

  afterEach(async () => {
    cleanupApp(container);
    container.remove();
    resetTestRoutes();
    await page.viewport(1280, 900);
  });

  it("should preserve layout invariants given responsive components when crossing breakpoints", async () => {
    await page.viewport(390, 844);
    window.history.replaceState({}, "", "/responsive-layout");
    testRoute("/responsive-layout", () => (
      <Container class="responsive-container" size="xl" paddingX={{ base: "sm", lg: "xl" }}>
        <Section class="responsive-section" paddingY={{ base: "sm", lg: "xl" }}>
          <Block class="responsive-block" direction={{ base: "column", lg: "row" }}>
            <Grid class="responsive-grid" columns={{ base: 1, md: 2, lg: 3 }}>
              <div>one</div>
              <div>two</div>
              <div>three</div>
            </Grid>
          </Block>
        </Section>
      </Container>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();

    const block = container.querySelector<HTMLElement>(".responsive-block")!;
    const grid = container.querySelector<HTMLElement>(".responsive-grid")!;
    const content = container.querySelector<HTMLElement>(".responsive-container")!;
    const section = container.querySelector<HTMLElement>(".responsive-section")!;
    const mobilePadding = Number.parseFloat(getComputedStyle(content).paddingInlineStart);
    const mobileSectionPadding = Number.parseFloat(getComputedStyle(section).paddingBlockStart);

    expect(getComputedStyle(block).flexDirection).toBe("column");
    expect(columnCount(getComputedStyle(grid).gridTemplateColumns)).toBe(1);
    expect(content.scrollWidth).toBeLessThanOrEqual(content.clientWidth);

    await page.viewport(1024, 900);
    await settle();

    expect(getComputedStyle(block).flexDirection).toBe("row");
    expect(columnCount(getComputedStyle(grid).gridTemplateColumns)).toBe(3);
    expect(Number.parseFloat(getComputedStyle(content).paddingInlineStart)).toBeGreaterThan(
      mobilePadding,
    );
    expect(Number.parseFloat(getComputedStyle(section).paddingBlockStart)).toBeGreaterThan(
      mobileSectionPadding,
    );
  });

  it("should keep form control states readable in the default theme", async () => {
    window.history.replaceState({}, "", "/form-states");
    testRoute("/form-states", () => (
      <div data-theme="light">
        <Input aria-label="Invalid field" aria-invalid="true" value="invalid" />
        <Input aria-label="Disabled field" disabled value="disabled" />
        <Input aria-label="Readonly field" readOnly value="readonly" />
        <Input aria-label="Placeholder field" placeholder="Helpful placeholder" />
      </div>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();

    const invalid = container.querySelector<HTMLInputElement>('[aria-label="Invalid field"]')!;
    const disabled = container.querySelector<HTMLInputElement>('[aria-label="Disabled field"]')!;
    const readonly = container.querySelector<HTMLInputElement>('[aria-label="Readonly field"]')!;
    const placeholder = container.querySelector<HTMLInputElement>(
      '[aria-label="Placeholder field"]',
    )!;
    const normalBorder = getComputedStyle(readonly).borderColor;

    expect(getComputedStyle(invalid).borderColor).not.toBe(normalBorder);
    expect(getComputedStyle(disabled).opacity).toBe("0.5");
    expect(getComputedStyle(disabled).pointerEvents).toBe("none");
    expect(getComputedStyle(readonly).color).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(readonly).opacity).toBe("1");
    expect(getComputedStyle(placeholder, "::placeholder").color).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("should preserve table readability with long content at narrow widths", async () => {
    await page.viewport(390, 844);
    window.history.replaceState({}, "", "/narrow-table");
    testRoute("/narrow-table", () => (
      <div class="table-width" style="width:320px">
        <Table aria-label="Deployments">
          <TableHead>
            <TableRow>
              <TableHeaderCell>
                Deployment environment with a deliberately long heading
              </TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>production-north-america-control-plane-blue</TableCell>
              <TableCell>Healthy</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();

    const wrapper = container.querySelector<HTMLElement>(".table-width")!;
    const table = container.querySelector<HTMLTableElement>('[data-slot="table"]')!;
    const heading = container.querySelector<HTMLElement>('[data-slot="table-header-cell"]')!;
    const cell = container.querySelector<HTMLElement>('[data-slot="table-cell"]')!;

    expect(getComputedStyle(table).tableLayout).toBe("fixed");
    expect(table.getBoundingClientRect().width).toBeLessThanOrEqual(
      wrapper.getBoundingClientRect().width,
    );
    expect(getComputedStyle(heading).overflowWrap).toBe("anywhere");
    expect(getComputedStyle(cell).overflowWrap).toBe("anywhere");
  });

  it("should layer and focus a dropdown opened from a dialog inside a sidebar", async () => {
    window.history.replaceState({}, "", "/nested-overlays");
    testRoute("/nested-overlays", () => (
      <Sidebar aria-label="Workspace sidebar">
        <Dialog>
          <DialogTrigger>Open settings</DialogTrigger>
          <DialogPortal>
            <DialogOverlay />
            <DialogContent>
              <DialogTitle>Settings</DialogTitle>
              <DialogDescription>Choose a workspace action.</DialogDescription>
              <Dropdown id="dialog-actions">
                <DropdownTrigger>Actions</DropdownTrigger>
                <DropdownContent aria-label="Dialog actions">
                  <DropdownItem>Save</DropdownItem>
                  <DropdownItem>Archive</DropdownItem>
                </DropdownContent>
              </Dropdown>
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </Sidebar>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();
    container.querySelector<HTMLButtonElement>('[aria-haspopup="dialog"]')!.click();
    await settle();

    const dialog = document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
    dialog.querySelector<HTMLButtonElement>('[data-slot="dropdown-trigger"]')!.click();
    await settle();

    const menu = document.body.querySelector<HTMLElement>(
      '[data-slot="dropdown-content"][aria-label="Dialog actions"]',
    )!;
    expect(menu).not.toBeNull();
    expect(Number.parseInt(getComputedStyle(menu).zIndex, 10)).toBeGreaterThan(
      Number.parseInt(getComputedStyle(dialog).zIndex, 10),
    );
    expect(menu === document.activeElement || menu.contains(document.activeElement)).toBe(true);
  });
});
