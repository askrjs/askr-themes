import { Button, Input } from "../../../src/controls";
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
} from "../../../src/overlays";
import { mountRoute } from "./_spa";

import "../../../src/themes/default/index.css";

/** Real controls plus a dialog that layers a popover and a dropdown above itself. */
export default async function layeredOverlays(root: HTMLElement): Promise<void> {
  await mountRoute(root, "/forced-colors", () => (
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
}
