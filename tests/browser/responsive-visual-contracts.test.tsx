import { page } from "@vitest/browser/context";
import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";
import { cleanupApp, createSPA } from "@askrjs/askr/boot";

import {
  Block,
  Center,
  Cluster,
  Container,
  Grid,
  Heading,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Stack,
  Text,
  Toolbar,
} from "../../src/core";
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
          <Toolbar title="A long project title" actions={<button>Toolbar action</button>} />
          <PageHeader title="Overview" actions={<button>Header action</button>} />
        </Section>
      </Container>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();

    const block = container.querySelector<HTMLElement>(".responsive-block")!;
    const grid = container.querySelector<HTMLElement>(".responsive-grid")!;
    const content = container.querySelector<HTMLElement>(".responsive-container")!;
    const section = container.querySelector<HTMLElement>(".responsive-section")!;
    const toolbar = container.querySelector<HTMLElement>('[data-slot="toolbar"]')!;
    const pageHeader = container.querySelector<HTMLElement>('[data-slot="page-header"]')!;
    const mobilePadding = Number.parseFloat(getComputedStyle(content).paddingInlineStart);
    const mobileSectionPadding = Number.parseFloat(getComputedStyle(section).paddingBlockStart);

    expect(getComputedStyle(block).flexDirection).toBe("column");
    expect(getComputedStyle(section).flexDirection).toBe("column");
    expect(getComputedStyle(toolbar).flexDirection).toBe("column");
    expect(getComputedStyle(pageHeader).flexDirection).toBe("column");
    expect(columnCount(getComputedStyle(grid).gridTemplateColumns)).toBe(1);
    const contentRight = content.getBoundingClientRect().right;
    const overflowDetails = [content, ...content.querySelectorAll<HTMLElement>("*")]
      .map((element) => ({
        slot: element.getAttribute("data-slot") ?? element.tagName.toLowerCase(),
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        right: Math.round(element.getBoundingClientRect().right),
      }))
      .filter((entry) => entry.scrollWidth > entry.clientWidth || entry.right > contentRight);
    expect(content.scrollWidth, JSON.stringify(overflowDetails)).toBeLessThanOrEqual(
      content.clientWidth,
    );

    await page.viewport(1024, 900);
    await settle();

    expect(getComputedStyle(block).flexDirection).toBe("row");
    expect(getComputedStyle(toolbar).flexDirection).toBe("row");
    expect(getComputedStyle(pageHeader).flexDirection).toBe("row");
    expect(columnCount(getComputedStyle(grid).gridTemplateColumns)).toBe(3);
    expect(Number.parseFloat(getComputedStyle(content).paddingInlineStart)).toBeGreaterThan(
      mobilePadding,
    );
    expect(Number.parseFloat(getComputedStyle(section).paddingBlockStart)).toBeGreaterThan(
      mobileSectionPadding,
    );
  });

  it("should let Page content occupy the available container width", async () => {
    window.history.replaceState({}, "", "/page-width");
    testRoute("/page-width", () => (
      <Page>
        <Heading level={1}>Operations overview</Heading>
        <Grid class="page-grid" columns={2}>
          <div>Deployments</div>
          <div>Incidents</div>
        </Grid>
      </Page>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();

    const pageContainer = container.querySelector<HTMLElement>('[data-slot="container"]')!;
    const pageContent = pageContainer.querySelector<HTMLElement>('[data-slot="block"]')!;
    const grid = container.querySelector<HTMLElement>(".page-grid")!;

    expect(pageContent.getBoundingClientRect().width).toBeGreaterThan(
      pageContainer.getBoundingClientRect().width * 0.8,
    );
    expect(grid.getBoundingClientRect().width).toBeGreaterThan(0);
    expect(columnCount(getComputedStyle(grid).gridTemplateColumns)).toBe(2);
  });

  it("should let nested Blocks shrink inside a constrained row", async () => {
    window.history.replaceState({}, "", "/block-shrink");
    testRoute("/block-shrink", () => (
      <Block class="constrained-row" direction="row" width="full" style="width:280px">
        <Block class="shrinking-child" grow>
          <Text truncate>production-control-plane-event-identifier-with-long-content</Text>
        </Block>
        <Block class="fixed-child">Inspect</Block>
        <Block class="explicit-auto" minWidth="auto">
          Natural width
        </Block>
      </Block>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();

    const row = container.querySelector<HTMLElement>(".constrained-row")!;
    const shrinkingChild = container.querySelector<HTMLElement>(".shrinking-child")!;
    const explicitAuto = container.querySelector<HTMLElement>(".explicit-auto")!;

    expect(getComputedStyle(shrinkingChild).minWidth).toBe("0px");
    expect(shrinkingChild.getBoundingClientRect().right).toBeLessThanOrEqual(
      row.getBoundingClientRect().right,
    );
    expect(getComputedStyle(explicitAuto).minWidth).toBe("auto");
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
    expect(getComputedStyle(disabled).opacity).toBe("1");
    expect(getComputedStyle(disabled).pointerEvents).toBe("none");
    expect(getComputedStyle(readonly).color).not.toBe("rgba(0, 0, 0, 0)");
    expect(getComputedStyle(readonly).opacity).toBe("1");
    expect(getComputedStyle(placeholder, "::placeholder").color).not.toBe("rgba(0, 0, 0, 0)");
  });

  it("should preserve table readability with long content at narrow widths", async () => {
    await page.viewport(390, 844);
    window.history.replaceState({}, "", "/narrow-table");
    testRoute("/narrow-table", () => (
      <div class="table-width" style="width:320px;overflow-x:auto">
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

    expect(getComputedStyle(table).tableLayout).toBe("auto");
    expect(getComputedStyle(wrapper).overflowX).toBe("auto");
    expect(getComputedStyle(heading).whiteSpace).toBe("normal");
    expect(getComputedStyle(cell).whiteSpace).toBe("normal");
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

  it("should preserve intent layout geometry without narrow viewport overflow", async () => {
    await page.viewport(390, 844);
    window.history.replaceState({}, "", "/intent-layouts");
    testRoute("/intent-layouts", () => (
      <Stack gap="sm" width="full" data-test="stack">
        <Cluster gap="xs" data-test="cluster">
          <span style="width:240px;flex-shrink:0">Primary action</span>
          <span style="width:240px;flex-shrink:0">Secondary action</span>
        </Cluster>
        <Center width="full" height="sm" data-test="center">
          <span>Loading</span>
        </Center>
      </Stack>
    ));

    await createSPA({ root: container, registry: createTestRegistry() });
    await settle();

    const stack = container.querySelector<HTMLElement>('[data-test="stack"]')!;
    const cluster = container.querySelector<HTMLElement>('[data-test="cluster"]')!;
    const center = container.querySelector<HTMLElement>('[data-test="center"]')!;
    const clusterChildren = [...cluster.children] as HTMLElement[];
    const centerBounds = center.getBoundingClientRect();
    const centeredChild = center.firstElementChild!.getBoundingClientRect();

    expect(stack.scrollWidth).toBeLessThanOrEqual(stack.clientWidth);
    expect(clusterChildren[1]!.getBoundingClientRect().top).toBeGreaterThan(
      clusterChildren[0]!.getBoundingClientRect().top,
    );
    expect(
      Math.abs(
        centeredChild.left + centeredChild.width / 2 - (centerBounds.left + centerBounds.width / 2),
      ),
    ).toBeLessThanOrEqual(1);
    expect(
      Math.abs(
        centeredChild.top + centeredChild.height / 2 - (centerBounds.top + centerBounds.height / 2),
      ),
    ).toBeLessThanOrEqual(1);
  });
});
