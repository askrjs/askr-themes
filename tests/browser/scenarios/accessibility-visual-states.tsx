import { Button, Input } from "../../../src/controls";
import {
  Dialog,
  DialogClose,
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
} from "../../../src/overlays";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

/**
 * Accessibility visual-state fixtures. Both scenarios pin `data-theme` on the
 * document element before booting, so the default theme resolves every token
 * for the mode under test; the colour maths itself stays in the spec.
 */

/** Mirrored by `accessibility-visual-states.spec.ts`, which asserts per surface. */
const FOCUS_SURFACES = [
  "bg",
  "surface",
  "surface-muted",
  "surface-raised",
  "surface-overlay",
  "primary",
];

interface ModeOptions {
  mode: string;
}

export async function focusRing(root: HTMLElement, options: ModeOptions): Promise<void> {
  const { mode } = options;
  document.documentElement.setAttribute("data-theme", mode);

  await mountRoute(root, `/focus-${mode}`, () => (
    <main style="background:var(--ak-color-bg);padding:1rem">
      {FOCUS_SURFACES.map((surface) => (
        <div
          data-focus-surface={surface}
          style={`background:var(--ak-color-${surface});overflow:visible;padding:0.75rem`}
        >
          <Button variant="outline">Focus {surface}</Button>
        </div>
      ))}
    </main>
  ));
}

export async function visualStates(root: HTMLElement, options: ModeOptions): Promise<void> {
  const { mode } = options;
  document.documentElement.setAttribute("data-theme", mode);

  await mountRoute(root, `/visual-states-${mode}`, () => (
    <main data-page style="background:var(--ak-color-bg);padding:1rem">
      <Input aria-label="Enabled input" value="enabled" />
      <Input aria-label="Disabled input" disabled value="disabled" />
      <Dialog>
        <DialogTrigger>Open layers</DialogTrigger>
        <DialogPortal>
          <DialogOverlay />
          <DialogContent>
            <DialogTitle>Layer matrix</DialogTitle>
            <Button variant="outline">Dialog action</Button>
            <Popover>
              <PopoverTrigger>Open nested popover</PopoverTrigger>
              <PopoverPortal>
                <PopoverContent>
                  <Button variant="outline">Popover action</Button>
                  <PopoverClose>Close popover</PopoverClose>
                </PopoverContent>
              </PopoverPortal>
            </Popover>
            <Dropdown>
              <DropdownTrigger>Open menu</DropdownTrigger>
              <DropdownContent aria-label="Contrast menu">
                <DropdownItem>
                  <svg data-slot="icon" aria-hidden="true" />
                  Normal action
                </DropdownItem>
                <DropdownItem variant="destructive">Destructive action</DropdownItem>
                <DropdownItem disabled>Disabled action</DropdownItem>
              </DropdownContent>
            </Dropdown>
            <DialogClose>Close dialog</DialogClose>
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </main>
  ));
}
