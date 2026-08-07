import type { LinkProps } from "@askrjs/askr/router";
import type { JSX } from "@askrjs/askr/jsx-runtime";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import type {
  DialogContentProps,
  DialogOverlayProps,
  DialogProps,
  DialogTriggerAsChildProps,
  DialogTriggerProps,
} from "@askrjs/ui";

export type CommandPaletteProps = DialogProps;
export type CommandPaletteTriggerProps = DialogTriggerProps;
export type CommandPaletteTriggerAsChildProps = DialogTriggerAsChildProps;

export type CommandPaletteContentProps = Omit<
  DialogContentProps,
  "children" | "title" | "onEscapeKeyDown" | "onInteractOutside" | "onPointerDownOutside"
> & {
  children?: unknown;
  title: string;
  description?: string;
  initialFocus?: string | (() => HTMLElement | null) | false;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  overlayProps?: DialogOverlayProps;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  onInteractOutside?: (event: Event) => void;
  onPointerDownOutside?: (event: PointerEvent) => void;
};

export type CommandPaletteLinkProps = LinkProps & {
  closeOnSelect?: boolean;
  onBeforeNavigate?: () => void;
};

export type CommandPaletteListProps = Omit<JSX.IntrinsicElements["ul"], "children" | "ref"> & {
  children?: unknown;
  ref?: Ref<HTMLUListElement>;
};
