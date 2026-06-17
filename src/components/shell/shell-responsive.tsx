import { For } from "@askrjs/askr/control";
import { resource } from "@askrjs/askr/resources";
import type { JSXElement } from "@askrjs/askr/foundations";
import { isJsxElement, toChildArray } from "../_internal/jsx";

export type ShellResponsivePanelProps = {
  active: boolean;
  collapseLabel: string;
  onClose: () => void;
  open: boolean;
  panelId?: string;
};

let shellScrollLockCount = 0;
let shellScrollLockPreviousValue: string | null = null;

function acquireShellScrollLock(): void {
  if (typeof document === "undefined") return;

  const body = document.body;
  if (shellScrollLockCount === 0) {
    shellScrollLockPreviousValue = body.getAttribute("data-shell-scroll-lock");
  }

  shellScrollLockCount += 1;
  body.setAttribute("data-shell-scroll-lock", "true");
}

function releaseShellScrollLock(): void {
  if (typeof document === "undefined" || shellScrollLockCount === 0) return;

  shellScrollLockCount -= 1;
  if (shellScrollLockCount > 0) return;

  const body = document.body;
  if (shellScrollLockPreviousValue === null) {
    body.removeAttribute("data-shell-scroll-lock");
  } else {
    body.setAttribute("data-shell-scroll-lock", shellScrollLockPreviousValue);
  }

  shellScrollLockPreviousValue = null;
}

export function isShellPanelChild(child: unknown, panelComponent: unknown): child is JSXElement {
  return isJsxElement(child) && child.type === panelComponent;
}

export function renderKeyedShellChildren(children: unknown, keyPrefix: string): JSX.Element {
  const childList = toChildArray(children);
  const needsKeying = childList.some((child) => isJsxElement(child) && child.key == null);
  const keyedChildren = needsKeying
    ? childList.map((child, index) => {
        if (!isJsxElement(child) || child.key != null) {
          return child;
        }

        return {
          ...child,
          key: `${keyPrefix}-${index}`,
        };
      })
    : childList;

  return (
    <For
      each={() => keyedChildren}
      by={(child, index) =>
        isJsxElement(child) && child.key != null ? String(child.key) : `${keyPrefix}-${index}`
      }
    >
      {(child) => child as never}
    </For>
  );
}

export function renderKeyedShellPanelChildren(
  children: unknown,
  keyPrefix: string,
  panelProps: ShellResponsivePanelProps,
): JSX.Element {
  const childList = toChildArray(children);
  const needsPanelProps = childList.some((child) => {
    if (!isJsxElement(child)) {
      return false;
    }

    const props = child.props as Record<string, unknown> | undefined;

    return (
      props?.active !== panelProps.active ||
      props?.collapseLabel !== panelProps.collapseLabel ||
      props?.onClose !== panelProps.onClose ||
      props?.open !== panelProps.open ||
      props?.panelId !== panelProps.panelId
    );
  });
  const keyedChildren = needsPanelProps
    ? childList.map((child, index) => {
        if (!isJsxElement(child)) {
          return child;
        }

        const props = child.props as Record<string, unknown> | undefined;

        if (
          props?.active === panelProps.active &&
          props?.collapseLabel === panelProps.collapseLabel &&
          props?.onClose === panelProps.onClose &&
          props?.open === panelProps.open &&
          props?.panelId === panelProps.panelId
        ) {
          return child;
        }

        return {
          ...child,
          key: child.key != null ? child.key : `${keyPrefix}-${index}`,
          props: {
            ...props,
            active: panelProps.active,
            collapseLabel: panelProps.collapseLabel,
            onClose: panelProps.onClose,
            open: panelProps.open,
            panelId: panelProps.panelId,
          },
        };
      })
    : childList;

  return (
    <For
      each={() => keyedChildren}
      by={(child, index) =>
        isJsxElement(child) && child.key != null ? String(child.key) : `${keyPrefix}-${index}`
      }
    >
      {(child) => child as never}
    </For>
  );
}

export function ShellResponsiveWatcher<TBreakpoint extends string>(props: {
  breakpoint: TBreakpoint;
  isCollapsed: (breakpoint: TBreakpoint) => boolean;
  onExpand: () => void;
  onResize: (nextCollapsed: boolean) => void;
}): JSX.Element | null {
  const { breakpoint, isCollapsed, onExpand, onResize } = props;

  resource(
    ({ signal }: { signal: AbortSignal }) => {
      const updateCollapsedState = () => {
        const nextCollapsed = isCollapsed(breakpoint);
        onResize(nextCollapsed);

        if (!nextCollapsed) {
          onExpand();
        }
      };

      updateCollapsedState();

      if (typeof window === "undefined") {
        return null;
      }

      window.addEventListener("resize", updateCollapsedState);
      signal.addEventListener(
        "abort",
        () => {
          window.removeEventListener("resize", updateCollapsedState);
        },
        { once: true },
      );

      return null;
    },
    [breakpoint],
  );

  return null;
}

export function ShellPanelWatcher(props: {
  contentId?: string;
  onClose: () => void;
  open: boolean;
  panelSlot: string;
}): JSX.Element | null {
  const { contentId, onClose, open, panelSlot } = props;

  resource(
    ({ signal }: { signal: AbortSignal }) => {
      if (!open || typeof window === "undefined") {
        releaseShellScrollLock();
        return null;
      }

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Escape") {
          return;
        }

        event.preventDefault();
        onClose();
      };

      window.addEventListener("keydown", onKeyDown);

      const focusFrame =
        typeof window.requestAnimationFrame === "function"
          ? window.requestAnimationFrame(() => {
              const content =
                (typeof contentId === "string" ? document.getElementById(contentId) : null) ??
                document.querySelector<HTMLElement>(
                  `[data-slot="${panelSlot}"][data-state="open"]`,
                );

              content?.focus({ preventScroll: true });
            })
          : undefined;

      acquireShellScrollLock();

      signal.addEventListener(
        "abort",
        () => {
          window.removeEventListener("keydown", onKeyDown);

          if (focusFrame !== undefined && typeof window.cancelAnimationFrame === "function") {
            window.cancelAnimationFrame(focusFrame);
          }

          releaseShellScrollLock();
        },
        { once: true },
      );

      return null;
    },
    [open],
  );

  return null;
}
