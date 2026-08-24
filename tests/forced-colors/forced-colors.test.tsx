import { page, userEvent } from "@vitest/browser/context";
import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { afterEach, beforeEach, expect, it } from "vite-plus/test";

import { Button, Input } from "../../src/controls";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "../../src/overlays";
import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";
import { THEME_FAMILY_AUDIT_SELECTORS } from "../fixtures/component-audit-matrix";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  resetTestRoutes();
});

afterEach(() => {
  cleanupApp(container);
  container.remove();
  resetTestRoutes();
});

it("should preserve real controls and layered overlays in emulated forced colors", async () => {
  expect(matchMedia("(forced-colors: active)").matches).toBe(true);
  window.history.replaceState({}, "", "/forced-colors");
  testRoute("/forced-colors", () => (
    <main>
      <Button>Focusable action</Button>
      <Input aria-label="Disabled field" disabled value="disabled" />
      <Dialog>
        <DialogTrigger>Open layers</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>High contrast layers</DialogTitle>
            <Popover>
              <PopoverTrigger>Open popover</PopoverTrigger>
              <PopoverPortal>
                <PopoverContent>
                  Popover content
                  <PopoverClose>Close popover</PopoverClose>
                </PopoverContent>
              </PopoverPortal>
            </Popover>
            <Dropdown>
              <DropdownTrigger>Open menu</DropdownTrigger>
              <DropdownContent>
                <DropdownItem>Menu item</DropdownItem>
              </DropdownContent>
            </Dropdown>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </main>
  ));

  await createSPA({ root: container, registry: createTestRegistry() });
  await userEvent.tab();
  const focusedButton = container.querySelector<HTMLButtonElement>('[data-slot="button"]')!;
  expect(document.activeElement).toBe(focusedButton);
  expect(getComputedStyle(focusedButton).outlineStyle).not.toBe("none");

  const disabled = container.querySelector<HTMLInputElement>('[aria-label="Disabled field"]')!;
  expect(getComputedStyle(disabled).borderStyle).not.toBe("none");
  expect(Number.parseFloat(getComputedStyle(disabled).borderTopWidth)).toBeGreaterThanOrEqual(1);

  await userEvent.click(page.getByRole("button", { name: "Open layers" }));
  await settle();
  const dialog = document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
  expect(Number.parseFloat(getComputedStyle(dialog).borderTopWidth)).toBeGreaterThanOrEqual(2);

  await userEvent.click(page.getByRole("button", { name: "Open popover" }));
  await settle();
  const popover = document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')!;
  expect(Number.parseFloat(getComputedStyle(popover).borderTopWidth)).toBeGreaterThanOrEqual(2);
  await userEvent.click(page.getByRole("button", { name: "Close popover" }));
  await settle();

  await userEvent.click(page.getByRole("button", { name: "Open menu" }));
  await userEvent.keyboard("{Home}");
  const item = document.body.querySelector<HTMLElement>('[data-slot="dropdown-item"]')!;
  expect(getComputedStyle(item).outlineStyle).not.toBe("none");
});

it("should preserve virtual-table focus, hierarchy, and selection in emulated forced colors", async () => {
  expect(matchMedia("(forced-colors: active)").matches).toBe(true);
  container.innerHTML = `
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
  `;

  const table = container.querySelector<HTMLElement>('[data-slot="virtual-table"]')!;
  const focusTarget = container.querySelector<HTMLElement>('[data-slot="virtual-table-table"]')!;
  const tableHead = container.querySelector<HTMLElement>('[data-slot="virtual-table-head"]')!;
  const selectedRow = container.querySelector<HTMLElement>(
    '[data-slot="virtual-table-row"][data-selected="true"]',
  )!;

  await userEvent.tab();
  expect(document.activeElement).toBe(focusTarget);
  expect(getComputedStyle(table).outlineStyle).not.toBe("none");
  expect(getComputedStyle(table).borderTopStyle).not.toBe("none");
  expect(getComputedStyle(tableHead).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(getComputedStyle(selectedRow).outlineStyle).not.toBe("none");
  expect(getComputedStyle(selectedRow).backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
});

it("should keep every public theme family perceptible in emulated forced colors", async () => {
  expect(matchMedia("(forced-colors: active)").matches).toBe(true);

  for (const [family, selector] of Object.entries(THEME_FAMILY_AUDIT_SELECTORS)) {
    const slot = selector.match(/data-slot="([^"]+)"/u)?.[1];
    const element = document.createElement("div");
    element.dataset.slot = slot!;
    element.tabIndex = 0;
    element.textContent = family;
    container.append(element);
  }

  for (const element of container.children) {
    (element as HTMLElement).focus();
    const style = getComputedStyle(element);
    expect(style.color, (element as HTMLElement).dataset.slot).not.toBe("rgba(0, 0, 0, 0)");
    expect(style.outlineStyle, (element as HTMLElement).dataset.slot).not.toBe("none");
  }
});
