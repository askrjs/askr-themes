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
  PopoverContent,
  PopoverPortal,
  PopoverTrigger,
} from "../../src/overlays";
import { createTestRegistry, resetTestRoutes, testRoute } from "../router-test-utils";

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
                <PopoverContent>Popover content</PopoverContent>
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
  expect(Number(getComputedStyle(disabled).borderTopWidth)).toBeGreaterThanOrEqual(1);

  await userEvent.click(page.getByRole("button", { name: "Open layers" }));
  await settle();
  const dialog = document.body.querySelector<HTMLElement>('[data-slot="dialog-content"]')!;
  expect(Number(getComputedStyle(dialog).borderTopWidth)).toBeGreaterThanOrEqual(2);

  await userEvent.click(page.getByRole("button", { name: "Open popover" }));
  await settle();
  const popover = document.body.querySelector<HTMLElement>('[data-slot="popover-content"]')!;
  expect(Number(getComputedStyle(popover).borderTopWidth)).toBeGreaterThanOrEqual(2);

  await userEvent.click(page.getByRole("button", { name: "Open menu" }));
  await userEvent.keyboard("{ArrowDown}");
  const item = document.body.querySelector<HTMLElement>('[data-slot="dropdown-item"]')!;
  expect(getComputedStyle(item).outlineStyle).not.toBe("none");
});
