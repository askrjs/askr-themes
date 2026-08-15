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

/** Props for the {@link CommandPalette} component. */
export type CommandPaletteProps = DialogProps;
/** Props for the {@link CommandPaletteTrigger} component. */
export type CommandPaletteTriggerProps = DialogTriggerProps;
/** Props for {@link CommandPaletteTrigger} rendered with `asChild`. */
export type CommandPaletteTriggerAsChildProps = DialogTriggerAsChildProps;

/** Props for the {@link CommandPaletteContent} component. */
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

/** Props for the {@link CommandPaletteLink} component. */
export type CommandPaletteLinkProps = LinkProps & {
  closeOnSelect?: boolean;
  onBeforeNavigate?: () => void;
};

/** Props for the {@link CommandPaletteList} component. */
export type CommandPaletteListProps = Omit<JSX.IntrinsicElements["ul"], "children" | "ref"> & {
  children?: unknown;
  ref?: Ref<HTMLUListElement>;
};
