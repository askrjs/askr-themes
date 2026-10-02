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
  "primary-soft",
];

interface ModeOptions {
  mode: string;
}

/**
 * One row per surface, each holding the controls whose focus ring used to touch
 * a primary fill (primary button, checked checkbox, checked switch) plus an
 * input and the attached groups whose neighbours can cover or clip the ring, or
 * whose primary fill sits right next to the ring (an input or outline button
 * beside a primary button, and a primary split button).
 * Every focus target carries `data-focus-case`.
 */
export async function focusGap(root: HTMLElement, options: ModeOptions): Promise<void> {
  const { mode } = options;
  document.documentElement.setAttribute("data-theme", mode);

  await mountRoute(root, `/focus-gap-${mode}`, () => (
    <main style="background:var(--ak-color-bg);padding:1rem">
      {FOCUS_SURFACES.map((surface) => (
        <div
          data-focus-surface={surface}
          style={`background:var(--ak-color-${surface});padding:0.75rem;display:flex;flex-wrap:wrap;gap:1rem;align-items:center`}
        >
          <button type="button" data-slot="button" data-focus-case="primary-button">
            Save
          </button>
          <button
            type="button"
            role="checkbox"
            aria-checked="true"
            aria-label="Checked"
            data-slot="checkbox"
            data-state="checked"
            data-focus-case="checkbox"
          />
          <button
            type="button"
            role="switch"
            aria-checked="true"
            aria-label="On"
            data-slot="switch"
            data-state="checked"
            data-focus-case="switch"
          />
          <input data-slot="input" aria-label="Name" data-focus-case="input" />
          <div data-slot="button-group" data-attached="true" role="group">
            <button type="button" data-slot="button" data-variant="outline">
              Day
            </button>
            <button
              type="button"
              data-slot="button"
              data-variant="outline"
              data-focus-case="group-button"
            >
              Week
            </button>
            <button type="button" data-slot="button">
              Month
            </button>
          </div>
          <div data-slot="input-group" data-attached="true" style="inline-size:16rem">
            <input data-slot="input" aria-label="Search" data-focus-case="group-input" />
            <button type="button" data-slot="button" data-focus-case="group-input-button">
              Go
            </button>
          </div>
          <div data-slot="button-group" data-attached="true" role="group">
            <button type="button" data-slot="button" data-focus-case="group-split-button">
              Save
            </button>
            <button type="button" data-slot="button" aria-label="More save options">
              ▾
            </button>
          </div>
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
