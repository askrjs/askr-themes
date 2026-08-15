import type { JSX } from "@askrjs/askr/jsx-runtime";
import { Slot } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import { DialogContent, DialogDescription, DialogTitle } from "@askrjs/ui";
import { Block } from "./block";
import { classes } from "./_internal/classes";
import { mergeProps } from "./_internal/merge-props";

const CatalogDialogContent = DialogContent as (props: Record<string, unknown>) => JSX.Element;
const CatalogDialogTitle = DialogTitle as (props: Record<string, unknown>) => JSX.Element;
const CatalogDialogDescription = DialogDescription as (
  props: Record<string, unknown>,
) => JSX.Element;

type CatalogElement = keyof JSX.IntrinsicElements;

/**
 * Shared prop shape for the shadcn-compatible catalog primitives below: a
 * polymorphic `as`/`asChild` element plus passthrough attributes.
 */
export type CatalogComponentProps = Record<string, unknown> & {
  as?: CatalogElement;
  asChild?: boolean;
  children?: unknown;
  class?: string;
  ref?: Ref<HTMLElement>;
};

type CatalogDefaults = {
  className?: string;
  element?: CatalogElement;
  role?: string;
  slot: string;
};

function catalogPart(props: CatalogComponentProps, defaults: CatalogDefaults): JSX.Element {
  const { as, asChild, children, class: className, ref, ...rest } = props;
  const Element = (as ?? defaults.element ?? "div") as "div";
  const finalProps = mergeProps(rest, {
    ref,
    class: classes(defaults.className, className),
    "data-slot": defaults.slot,
    role: defaults.role,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <Element {...finalProps}>{children}</Element>;
}

function buttonPart(props: CatalogComponentProps, slot: string, className?: string): JSX.Element {
  const { as, asChild, children, ref, class: classProp, type = "button", ...rest } = props;
  void as;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes(className, classProp),
    "data-slot": slot,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return (
    <button type={type as "button" | "submit" | "reset"} {...finalProps}>
      {children}
    </button>
  );
}

function normalizeLegacySpace(value: unknown): unknown {
  if (value === "none") return "0";
  if (value === "1") return "xs";
  if (value === "2") return "xs";
  if (value === "3") return "sm";
  if (value === "4") return "md";
  if (value === "5") return "lg";
  if (value === "6") return "xl";
  if (value === "8") return "2xl";
  return value;
}

function layoutAlias(props: CatalogComponentProps, defaults: Record<string, unknown>): JSX.Element {
  const { gap, p, padding, style, wrap, ...rest } = props as CatalogComponentProps & {
    gap?: unknown;
    p?: unknown;
    padding?: unknown;
    style?: Record<string, unknown>;
    wrap?: boolean | string;
  };
  const BlockComponent = Block as (blockProps: Record<string, unknown>) => JSX.Element;
  const wrapStyle = wrap
    ? {
        ...style,
        flexWrap: "wrap",
      }
    : style;

  return (
    <BlockComponent
      {...defaults}
      {...rest}
      gap={normalizeLegacySpace(gap)}
      padding={padding ?? normalizeLegacySpace(p)}
      style={wrapStyle}
    />
  );
}

/** Legacy `Box` layout alias for {@link Block} with no default direction. */
export function Box(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, {});
}

/** Legacy `Stack` layout alias for {@link Block} that defaults to a column direction. */
export function Stack(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, { direction: "column" });
}

/** Legacy `Inline` layout alias for {@link Block} that defaults to a row direction. */
export function Inline(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, { direction: "row" });
}

/** Legacy `Shell` layout alias for {@link Block}; the `variant` prop is accepted but ignored. */
export function Shell(props: CatalogComponentProps & { variant?: unknown }): JSX.Element {
  const { variant: _variant, ...rest } = props;
  void _variant;
  return layoutAlias(rest, {});
}

/** Legacy `ShellNav` layout alias for {@link Block}. */
export function ShellNav(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, {});
}

/** Legacy `ShellMain` layout alias for {@link Block} that renders a growing `<main>` element. */
export function ShellMain(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, { as: "main", grow: true });
}

/** Renders the `alert-title` part of the shadcn-compatible catalog primitives. */
export function AlertTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "alert-title", element: "h3", className: "alert-title" });
}

/** Renders the `alert-description` part of the shadcn-compatible catalog primitives. */
export function AlertDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, {
    slot: "alert-description",
    element: "p",
    className: "alert-description",
  });
}

/** Renders the `breadcrumb` part of the shadcn-compatible catalog primitives. */
export function Breadcrumb(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb", element: "nav", role: "navigation" });
}

/** Renders the `breadcrumb-list` part of the shadcn-compatible catalog primitives. */
export function BreadcrumbList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb-list", element: "ol" });
}

/** Renders the `breadcrumb-item` part of the shadcn-compatible catalog primitives. */
export function BreadcrumbItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb-item", element: "li" });
}

/** Renders the `breadcrumb-link` part of the shadcn-compatible catalog primitives. */
export function BreadcrumbLink(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb-link", element: "a" });
}

/** Renders the current (non-link) breadcrumb page, marked `aria-current="page"`. */
export function BreadcrumbPage(props: CatalogComponentProps): JSX.Element {
  return catalogPart(
    { "aria-current": "page", ...props },
    {
      slot: "breadcrumb-page",
      element: "span",
    },
  );
}

/** Renders the separator between breadcrumb items (defaults to `"/"`). */
export function BreadcrumbSeparator(props: CatalogComponentProps): JSX.Element {
  const { children = "/", ...rest } = props;
  return catalogPart(
    { "aria-hidden": "true", children, ...rest },
    {
      slot: "breadcrumb-separator",
      element: "li",
    },
  );
}

/** Renders a non-interactive ellipsis marker in a breadcrumb trail. */
export function BreadcrumbEllipsis(props: CatalogComponentProps): JSX.Element {
  const { children = "...", ...rest } = props;
  return catalogPart(
    { "aria-hidden": "true", children, ...rest },
    {
      slot: "breadcrumb-ellipsis",
      element: "span",
    },
  );
}

/** Renders the `calendar` part of the shadcn-compatible catalog primitives. */
export function Calendar(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar" });
}

/** Renders the `calendar-header` part of the shadcn-compatible catalog primitives. */
export function CalendarHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-header" });
}

/** Renders the `calendar-caption` part of the shadcn-compatible catalog primitives. */
export function CalendarCaption(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-caption" });
}

/** Renders the `calendar-nav` part of the shadcn-compatible catalog primitives. */
export function CalendarNav(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-nav" });
}

/** Button that navigates the calendar to the previous month. */
export function CalendarPreviousButton(props: CatalogComponentProps): JSX.Element {
  const { children = "Previous month", ...rest } = props;
  return buttonPart(
    { "aria-label": "Previous month", children, ...rest },
    "calendar-previous",
    "btn btn-icon btn-ghost",
  );
}

/** Button that navigates the calendar to the next month. */
export function CalendarNextButton(props: CatalogComponentProps): JSX.Element {
  const { children = "Next month", ...rest } = props;
  return buttonPart(
    { "aria-label": "Next month", children, ...rest },
    "calendar-next",
    "btn btn-icon btn-ghost",
  );
}

/** Renders the `calendar-grid` part of the shadcn-compatible catalog primitives. */
export function CalendarGrid(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-grid", role: "grid" });
}

/** Renders the `calendar-head` part of the shadcn-compatible catalog primitives. */
export function CalendarHead(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-head", role: "row" });
}

/** Renders the `calendar-body` part of the shadcn-compatible catalog primitives. */
export function CalendarBody(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-body" });
}

/** Renders the `calendar-row` part of the shadcn-compatible catalog primitives. */
export function CalendarRow(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-row", role: "row" });
}

/** Renders the `calendar-cell` part of the shadcn-compatible catalog primitives. */
export function CalendarCell(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-cell", role: "gridcell" });
}

/** Renders a single selectable day cell in the calendar grid, with selection/range/today state exposed as data attributes. */
export function CalendarDay(
  props: CatalogComponentProps & {
    disabled?: boolean;
    outside?: boolean;
    rangeEnd?: boolean;
    rangeMiddle?: boolean;
    rangeStart?: boolean;
    selected?: boolean;
    today?: boolean;
  },
): JSX.Element {
  const { disabled, outside, rangeEnd, rangeMiddle, rangeStart, selected, today, ...rest } = props;
  return buttonPart(
    {
      disabled,
      "aria-disabled": disabled ? "true" : undefined,
      "aria-selected": selected ? "true" : undefined,
      "data-disabled": disabled ? "" : undefined,
      "data-outside": outside ? "true" : undefined,
      "data-range-end": rangeEnd ? "true" : undefined,
      "data-range-middle": rangeMiddle ? "true" : undefined,
      "data-range-start": rangeStart ? "true" : undefined,
      "data-selected": selected ? "true" : undefined,
      "data-today": today ? "true" : undefined,
      ...rest,
    },
    "calendar-day",
  );
}

/** Renders the `carousel` part of the shadcn-compatible catalog primitives. */
export function Carousel(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "carousel" });
}

/** Renders the `carousel-content` part of the shadcn-compatible catalog primitives. */
export function CarouselContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "carousel-content" });
}

/** Renders the `carousel-item` part of the shadcn-compatible catalog primitives. */
export function CarouselItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "carousel-item" });
}

/** Button that navigates the carousel to the previous item. */
export function CarouselPrevious(props: CatalogComponentProps): JSX.Element {
  const { children = "Previous", ...rest } = props;
  return buttonPart({ children, ...rest }, "carousel-previous", "btn btn-icon");
}

/** Button that navigates the carousel to the next item. */
export function CarouselNext(props: CatalogComponentProps): JSX.Element {
  const { children = "Next", ...rest } = props;
  return buttonPart({ children, ...rest }, "carousel-next", "btn btn-icon");
}

/** Renders the `combobox` part of the shadcn-compatible catalog primitives. */
export function Combobox(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "combobox" });
}

/** Renders the combobox's text input, wired up with `role="combobox"`. */
export function ComboboxInput(props: CatalogComponentProps): JSX.Element {
  const { ref, class: className, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("input", className),
    "data-slot": "combobox-input",
    role: "combobox",
  });

  return <input {...finalProps} />;
}

/** Renders the `combobox-list` part of the shadcn-compatible catalog primitives. */
export function ComboboxList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "combobox-list", role: "listbox" });
}

/** Renders the `combobox-option` part of the shadcn-compatible catalog primitives. */
export function ComboboxOption(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "combobox-option", role: "option" });
}

/** Renders the `command` part of the shadcn-compatible catalog primitives. */
export function Command(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command" });
}

/** Renders the `command-dialog` part of the shadcn-compatible catalog primitives. */
export function CommandDialog(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-dialog" });
}

/** Renders the command palette's search `<input>`. */
export function CommandInput(props: CatalogComponentProps): JSX.Element {
  const { ref, class: className, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("input", className),
    "data-slot": "command-input",
  });

  return <input {...finalProps} />;
}

/** Renders the `command-header` part of the shadcn-compatible catalog primitives. */
export function CommandHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-header" });
}

/** Renders the `command-list` part of the shadcn-compatible catalog primitives. */
export function CommandList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-list", role: "listbox" });
}

/** Renders the `command-empty` part of the shadcn-compatible catalog primitives. */
export function CommandEmpty(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-empty" });
}

/** Renders the `command-group` part of the shadcn-compatible catalog primitives. */
export function CommandGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-group", role: "group" });
}

/** Renders the `command-group-heading` part of the shadcn-compatible catalog primitives. */
export function CommandGroupHeading(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-group-heading", element: "div" });
}

/** Renders a selectable command list entry, exposing `active`/`disabled`/`selected` as ARIA and data attributes. */
export function CommandItem(
  props: CatalogComponentProps & { active?: boolean; disabled?: boolean; selected?: boolean },
): JSX.Element {
  const { active, disabled, selected, ...rest } = props;
  return catalogPart(
    {
      "aria-disabled": disabled ? "true" : undefined,
      "aria-selected": selected || active ? "true" : undefined,
      "data-disabled": disabled ? "" : undefined,
      "data-selected": selected || active ? "true" : undefined,
      ...rest,
    },
    { slot: "command-item", role: "option" },
  );
}

/** Renders the `command-separator` part of the shadcn-compatible catalog primitives. */
export function CommandSeparator(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-separator", element: "div", role: "separator" });
}

/** Renders the `command-shortcut` part of the shadcn-compatible catalog primitives. */
export function CommandShortcut(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-shortcut", element: "span" });
}

/** Renders the `data-table` part of the shadcn-compatible catalog primitives. */
export function DataTable(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "data-table" });
}

/** Renders the `date-picker` part of the shadcn-compatible catalog primitives. */
export function DatePicker(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "date-picker" });
}

/** Renders the date picker's `<input type="date">` by default. */
export function DatePickerInput(props: CatalogComponentProps): JSX.Element {
  const { ref, class: className, type = "date", ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("input", className),
    "data-slot": "date-picker-input",
  });

  return <input type={type as string} {...finalProps} />;
}

/** Sets the `dir` attribute (defaulting to `"ltr"`) on its wrapping element for RTL/LTR scoping. */
export function Direction(props: CatalogComponentProps & { dir?: "ltr" | "rtl" }): JSX.Element {
  const { dir = "ltr", ...rest } = props;
  return catalogPart({ dir, ...rest }, { slot: "direction" });
}

/** Renders the `empty` part of the shadcn-compatible catalog primitives. */
export function Empty(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty" });
}

/** Renders the `empty-header` part of the shadcn-compatible catalog primitives. */
export function EmptyHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-header" });
}

/** Renders the `empty-title` part of the shadcn-compatible catalog primitives. */
export function EmptyTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-title", element: "h3" });
}

/** Renders the `empty-description` part of the shadcn-compatible catalog primitives. */
export function EmptyDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-description", element: "p" });
}

/** Renders the `empty-content` part of the shadcn-compatible catalog primitives. */
export function EmptyContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-content" });
}

/** Renders the `empty-media` part of the shadcn-compatible catalog primitives. */
export function EmptyMedia(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-media" });
}

/** Renders the `field-group` part of the shadcn-compatible catalog primitives. */
export function FieldGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-group" });
}

/** Renders the `field-set` part of the shadcn-compatible catalog primitives. */
export function FieldSet(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-set", element: "fieldset" });
}

/** Renders the `field-legend` part of the shadcn-compatible catalog primitives. */
export function FieldLegend(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-legend", element: "legend" });
}

/** Renders the `field-label` part of the shadcn-compatible catalog primitives. */
export function FieldLabel(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-label", element: "label", className: "label" });
}

/** Renders the `field-description` part of the shadcn-compatible catalog primitives. */
export function FieldDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-description", element: "p", className: "field-hint" });
}

/** Renders the `field-content` part of the shadcn-compatible catalog primitives. */
export function FieldContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-content" });
}

/** Renders the `field-title` part of the shadcn-compatible catalog primitives. */
export function FieldTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-title", element: "div" });
}

/** Renders the `field-separator` part of the shadcn-compatible catalog primitives. */
export function FieldSeparator(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-separator", role: "separator" });
}

/** Renders the `input-otp` part of the shadcn-compatible catalog primitives. */
export function InputOTP(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "input-otp", role: "group" });
}

/** Renders the `input-otp-group` part of the shadcn-compatible catalog primitives. */
export function InputOTPGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "input-otp-group", role: "group" });
}

/** Renders the `input-otp-slot` part of the shadcn-compatible catalog primitives. */
export function InputOTPSlot(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "input-otp-slot", element: "span" });
}

/** Renders the visual separator between InputOTP groups (defaults to `"-"`). */
export function InputOTPSeparator(props: CatalogComponentProps): JSX.Element {
  const { children = "-", ...rest } = props;
  return catalogPart(
    { "aria-hidden": "true", children, ...rest },
    {
      slot: "input-otp-separator",
      element: "span",
    },
  );
}

/** Renders a generic list item part, exposing `active`/`size`/`variant` as data attributes. */
export function Item(
  props: CatalogComponentProps & {
    active?: boolean;
    size?: "default" | "sm" | "xs";
    variant?: "default" | "outline" | "muted";
  },
): JSX.Element {
  const { active, size, variant, ...rest } = props;
  return catalogPart(
    {
      "data-active": active ? "true" : undefined,
      "data-size": size && size !== "default" ? size : undefined,
      "data-variant": variant && variant !== "default" ? variant : undefined,
      ...rest,
    },
    { slot: "item" },
  );
}

/** Renders the `item-group` part of the shadcn-compatible catalog primitives. */
export function ItemGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-group" });
}

/** Renders the `item-header` part of the shadcn-compatible catalog primitives. */
export function ItemHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-header" });
}

/** Renders the `item-media` part of the shadcn-compatible catalog primitives. */
export function ItemMedia(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-media" });
}

/** Renders the `item-content` part of the shadcn-compatible catalog primitives. */
export function ItemContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-content" });
}

/** Renders the `item-title` part of the shadcn-compatible catalog primitives. */
export function ItemTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-title" });
}

/** Renders the `item-description` part of the shadcn-compatible catalog primitives. */
export function ItemDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-description" });
}

/** Renders the `item-actions` part of the shadcn-compatible catalog primitives. */
export function ItemActions(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-actions" });
}

/** Renders the `item-footer` part of the shadcn-compatible catalog primitives. */
export function ItemFooter(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-footer" });
}

/** Renders the `kbd` part of the shadcn-compatible catalog primitives. */
export function Kbd(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "kbd", element: "kbd" });
}

/** Renders a styled native `<select>` element. */
export function NativeSelect(props: CatalogComponentProps): JSX.Element {
  const { children, ref, class: className, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("input", className),
    "data-slot": "native-select",
  });

  return <select {...finalProps}>{children}</select>;
}

/** Renders the `navigation-menu` part of the shadcn-compatible catalog primitives. */
export function NavigationMenu(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu", element: "nav" });
}

/** Renders the `navigation-menu-list` part of the shadcn-compatible catalog primitives. */
export function NavigationMenuList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-list", element: "ul" });
}

/** Renders the `navigation-menu-item` part of the shadcn-compatible catalog primitives. */
export function NavigationMenuItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-item", element: "li" });
}

/** Renders the `navigation-menu-content` part of the shadcn-compatible catalog primitives. */
export function NavigationMenuTrigger(props: CatalogComponentProps): JSX.Element {
  return buttonPart(props, "navigation-menu-trigger", "nav-item");
}

/** Renders the `navigation-menu-content` part of the shadcn-compatible catalog primitives. */
export function NavigationMenuContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-content" });
}

/** Renders the `navigation-menu-link` part of the shadcn-compatible catalog primitives. */
export function NavigationMenuLink(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-link", element: "a" });
}

/** Renders the `navigation-menu-viewport` part of the shadcn-compatible catalog primitives. */
export function NavigationMenuViewport(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-viewport" });
}

/** Renders the `navigation-menu-indicator` part of the shadcn-compatible catalog primitives. */
export function NavigationMenuIndicator(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-indicator" });
}

/** Renders the `pagination` part of the shadcn-compatible catalog primitives. */
export function Pagination(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "pagination", element: "nav", role: "navigation" });
}

/** Renders the `pagination-content` part of the shadcn-compatible catalog primitives. */
export function PaginationContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "pagination-content", element: "ul" });
}

/** Renders the `pagination-item` part of the shadcn-compatible catalog primitives. */
export function PaginationItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "pagination-item", element: "li" });
}

/** Renders a pagination page link, marking it `aria-current="page"` when `active`. */
export function PaginationLink(props: CatalogComponentProps & { active?: boolean }): JSX.Element {
  const { active, ...rest } = props;
  return catalogPart(
    {
      "aria-current": active ? "page" : undefined,
      "data-active": active ? "true" : undefined,
      ...rest,
    },
    { slot: "pagination-link", element: "a" },
  );
}

/** Pagination link that moves to the previous page. */
export function PaginationPrevious(props: CatalogComponentProps): JSX.Element {
  const { children = "Previous", ...rest } = props;
  return catalogPart({ children, ...rest }, { slot: "pagination-previous", element: "a" });
}

/** Pagination link that moves to the next page. */
export function PaginationNext(props: CatalogComponentProps): JSX.Element {
  const { children = "Next", ...rest } = props;
  return catalogPart({ children, ...rest }, { slot: "pagination-next", element: "a" });
}

/** Renders a non-interactive ellipsis marker between pagination links. */
export function PaginationEllipsis(props: CatalogComponentProps): JSX.Element {
  const { children = "...", ...rest } = props;
  return catalogPart(
    { "aria-hidden": "true", children, ...rest },
    {
      slot: "pagination-ellipsis",
      element: "span",
    },
  );
}

/** Renders the `resizable-panel-group` part of the shadcn-compatible catalog primitives. */
export function ResizablePanelGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "resizable-panel-group" });
}

/** Renders the `resizable-panel` part of the shadcn-compatible catalog primitives. */
export function ResizablePanel(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "resizable-panel" });
}

/** Renders the `resizable-handle` part of the shadcn-compatible catalog primitives. */
export function ResizableHandle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "resizable-handle", role: "separator" });
}

/** Renders the `tabs-list` part of the shadcn-compatible catalog primitives. */
export function TabsList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "tabs-list", role: "tablist" });
}

/** Renders the `tabs-content` part of the shadcn-compatible catalog primitives. */
export function TabsTrigger(props: CatalogComponentProps): JSX.Element {
  return buttonPart(props, "tabs-trigger", "tab");
}

/** Renders the `tabs-content` part of the shadcn-compatible catalog primitives. */
export function TabsContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "tabs-content", role: "tabpanel" });
}

/** Sheet variant of the dialog content part; defaults to sliding in from the right. */
export function SheetContent(
  props: CatalogComponentProps & {
    side?: "top" | "right" | "bottom" | "left";
  },
): JSX.Element {
  const { side = "right", ...rest } = props;
  return <CatalogDialogContent {...rest} data-side={side} data-slot="sheet-content" />;
}

/** Renders the `sheet-header` part of the shadcn-compatible catalog primitives. */
export function SheetHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sheet-header" });
}

/** Renders the `sheet-footer` part of the shadcn-compatible catalog primitives. */
export function SheetFooter(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sheet-footer" });
}

/** Sheet variant of the dialog title part. */
export function SheetTitle(props: CatalogComponentProps): JSX.Element {
  return <CatalogDialogTitle {...props} data-slot="sheet-title" />;
}

/** Sheet variant of the dialog description part. */
export function SheetDescription(props: CatalogComponentProps): JSX.Element {
  return <CatalogDialogDescription {...props} data-slot="sheet-description" />;
}

/** Renders the `sonner` part of the shadcn-compatible catalog primitives. */
export function Toaster(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sonner" });
}

/** Alias of {@link Toaster} kept for shadcn/sonner API compatibility. */
export const Sonner = Toaster;

/** Renders the `typography` part of the shadcn-compatible catalog primitives. */
export function Typography(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography" });
}

/** Renders the `typography-h1` part of the shadcn-compatible catalog primitives. */
export function TypographyH1(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h1", element: "h1" });
}

/** Renders the `typography-h2` part of the shadcn-compatible catalog primitives. */
export function TypographyH2(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h2", element: "h2" });
}

/** Renders the `typography-h3` part of the shadcn-compatible catalog primitives. */
export function TypographyH3(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h3", element: "h3" });
}

/** Renders the `typography-h4` part of the shadcn-compatible catalog primitives. */
export function TypographyH4(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h4", element: "h4" });
}

/** Renders the `typography-p` part of the shadcn-compatible catalog primitives. */
export function TypographyP(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-p", element: "p" });
}

/** Renders the `typography-blockquote` part of the shadcn-compatible catalog primitives. */
export function TypographyBlockquote(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-blockquote", element: "blockquote" });
}

/** Renders the `typography-list` part of the shadcn-compatible catalog primitives. */
export function TypographyList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-list", element: "ul" });
}

/** Renders the `typography-lead` part of the shadcn-compatible catalog primitives. */
export function TypographyLead(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-lead", element: "p" });
}

/** Renders the `typography-muted` part of the shadcn-compatible catalog primitives. */
export function TypographyMuted(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-muted", element: "p" });
}
