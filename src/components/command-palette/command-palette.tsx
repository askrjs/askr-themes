import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Link } from "@askrjs/askr/router";
import { defineScope, readScope, state } from "@askrjs/askr";
import { controllableState } from "@askrjs/askr/foundations/state";
import { composeRefs, type Ref } from "@askrjs/askr/foundations/utilities";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@askrjs/ui";
import { Command } from "../catalog";
import { classes } from "../_internal/classes";
import type {
  CommandPaletteContentProps,
  CommandPaletteLinkProps,
  CommandPaletteListProps,
  CommandPaletteProps,
  CommandPaletteTriggerAsChildProps,
  CommandPaletteTriggerProps,
} from "./command-palette.types";

type CommandPaletteContextValue = {
  close: () => void;
  restoreFocusSoon: () => void;
  setTrigger: (node: Element | null) => void;
};

const CommandPaletteContext = defineScope<CommandPaletteContextValue | null>(null);

function readCommandPaletteContext(): CommandPaletteContextValue {
  const context = readScope(CommandPaletteContext);
  if (!context) {
    throw new Error("CommandPalette components must be used within <CommandPalette>");
  }
  return context;
}

export function CommandPalette(props: CommandPaletteProps): JSX.Element {
  const { children, defaultOpen = false, onOpenChange, open, ...rest } = props;
  const openState = controllableState({
    defaultValue: defaultOpen,
    onChange: onOpenChange,
    value: open,
  });
  const focusState = state({
    open: false,
    returnFocus: null as HTMLElement | null,
    trigger: null as Element | null,
  })();
  const isOpen = openState();

  if (isOpen && !focusState.open && typeof document !== "undefined") {
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    focusState.returnFocus =
      active && active !== document.body
        ? active
        : focusState.trigger instanceof HTMLElement
          ? focusState.trigger
          : null;
  }
  focusState.open = isOpen;

  const restoreFocusSoon = () => {
    const returnFocus = focusState.returnFocus;
    if (!returnFocus) {
      return;
    }

    queueMicrotask(() => {
      queueMicrotask(() => {
        if (returnFocus.isConnected) {
          returnFocus.focus();
        }
      });
    });
  };

  return (
    <CommandPaletteContext
      value={{
        close: () => openState.set(false),
        restoreFocusSoon,
        setTrigger: (node) => {
          focusState.trigger = node;
        },
      }}
    >
      <Dialog {...rest} open={isOpen} onOpenChange={openState.set}>
        {children}
      </Dialog>
    </CommandPaletteContext>
  );
}

export function CommandPaletteTrigger(props: CommandPaletteTriggerProps): JSX.Element;
export function CommandPaletteTrigger(props: CommandPaletteTriggerAsChildProps): JSX.Element;
export function CommandPaletteTrigger(
  props: CommandPaletteTriggerProps | CommandPaletteTriggerAsChildProps,
): JSX.Element {
  const palette = readCommandPaletteContext();
  const ref = props.ref
    ? composeRefs(props.ref as Ref<Element>, palette.setTrigger)
    : palette.setTrigger;

  if (props.asChild) {
    return <DialogTrigger {...props} ref={ref} />;
  }

  return <DialogTrigger {...props} ref={ref as Ref<HTMLButtonElement>} />;
}

function preventDismiss(event: Event, shouldDismiss: boolean): void {
  if (!shouldDismiss) {
    event.preventDefault();
  }
}

export function CommandPaletteContent(props: CommandPaletteContentProps): JSX.Element {
  const palette = readCommandPaletteContext();
  const {
    children,
    class: className,
    closeOnBackdrop = true,
    closeOnEscape = true,
    description,
    initialFocus = '[data-slot="command-input"]',
    onEscapeKeyDown,
    onInteractOutside,
    onPointerDownOutside,
    overlayProps,
    ref,
    title,
    ...rest
  } = props;
  const focusInitialTarget = (node: HTMLDivElement | null) => {
    if (!node) {
      palette.restoreFocusSoon();
      return;
    }

    if (initialFocus === false) {
      return;
    }

    queueMicrotask(() => {
      if (!node.isConnected) {
        return;
      }

      const target =
        typeof initialFocus === "function"
          ? initialFocus()
          : node.querySelector<HTMLElement>(initialFocus);
      target?.focus();
    });
  };
  const contentRef = ref
    ? composeRefs(ref as Ref<HTMLDivElement>, focusInitialTarget)
    : focusInitialTarget;

  return (
    <DialogPortal>
      <DialogOverlay {...overlayProps} data-command-palette-overlay="" />
      <DialogContent
        {...rest}
        class={className}
        data-command-palette-content=""
        ref={contentRef}
        onEscapeKeyDown={(event) => {
          onEscapeKeyDown?.(event);
          preventDismiss(event, closeOnEscape);
        }}
        onInteractOutside={(event) => {
          onInteractOutside?.(event);
          preventDismiss(event, closeOnBackdrop);
        }}
        onPointerDownOutside={(event) => {
          onPointerDownOutside?.(event);
          preventDismiss(event, closeOnBackdrop);
        }}
      >
        <DialogTitle class="sr-only">{title}</DialogTitle>
        {description ? <DialogDescription class="sr-only">{description}</DialogDescription> : null}
        <Command>{children}</Command>
      </DialogContent>
    </DialogPortal>
  );
}

function composeBeforeNavigate(
  close: () => void,
  closeOnSelect: boolean,
  beforeNavigate: CommandPaletteLinkProps["onBeforeNavigate"],
  onPress: CommandPaletteLinkProps["onPress"],
): (event: Event) => void {
  return (event) => {
    beforeNavigate?.();
    if (!event.defaultPrevented) {
      onPress?.(event);
    }
    if (closeOnSelect && !event.defaultPrevented) {
      close();
    }
  };
}

export function CommandPaletteLink(props: CommandPaletteLinkProps): JSX.Element {
  const {
    children,
    class: className,
    closeOnSelect = true,
    onBeforeNavigate,
    onPress,
    ...rest
  } = props;
  const palette = readCommandPaletteContext();
  return (
    <li data-command-palette-result="">
      <Link
        {...rest}
        class={className}
        data-slot="command-item"
        onPress={composeBeforeNavigate(palette.close, closeOnSelect, onBeforeNavigate, onPress)}
      >
        {children}
      </Link>
    </li>
  );
}

export function CommandPaletteList(props: CommandPaletteListProps): JSX.Element {
  const { children, class: className, ...rest } = props;
  return (
    <ul {...rest} class={classes(className)} data-slot="command-list">
      {children}
    </ul>
  );
}
