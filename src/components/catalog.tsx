import { Slot } from "@askrjs/askr/foundations";
import type { Ref } from "@askrjs/askr/foundations/utilities";
import { DialogContent } from "@askrjs/ui";
import { Block } from "./block";
import { classes } from "./_internal/classes";
import { mergeProps } from "./_internal/merge-props";

const CatalogDialogContent = DialogContent as (props: Record<string, unknown>) => JSX.Element;

type CatalogElement = keyof JSX.IntrinsicElements;

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
  const { children, ref, class: classProp, type = "button", ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes(className, classProp),
    "data-slot": slot,
  });

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

export function Box(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, {});
}

export function Stack(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, { direction: "column" });
}

export function Inline(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, { direction: "row" });
}

export function Shell(props: CatalogComponentProps & { variant?: unknown }): JSX.Element {
  const { variant: _variant, ...rest } = props;
  void _variant;
  return layoutAlias(rest, {});
}

export function ShellNav(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, {});
}

export function ShellMain(props: CatalogComponentProps): JSX.Element {
  return layoutAlias(props, { as: "main", grow: true });
}

export function AlertTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "alert-title", element: "h3", className: "alert-title" });
}

export function AlertDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, {
    slot: "alert-description",
    element: "p",
    className: "alert-description",
  });
}

export function Breadcrumb(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb", element: "nav", role: "navigation" });
}

export function BreadcrumbList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb-list", element: "ol" });
}

export function BreadcrumbItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb-item", element: "li" });
}

export function BreadcrumbLink(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "breadcrumb-link", element: "a" });
}

export function BreadcrumbPage(props: CatalogComponentProps): JSX.Element {
  return catalogPart(
    { "aria-current": "page", ...props },
    {
      slot: "breadcrumb-page",
      element: "span",
    },
  );
}

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

export function Calendar(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar" });
}

export function CalendarHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-header" });
}

export function CalendarCaption(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-caption" });
}

export function CalendarNav(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-nav" });
}

export function CalendarPreviousButton(props: CatalogComponentProps): JSX.Element {
  const { children = "Previous month", ...rest } = props;
  return buttonPart(
    { "aria-label": "Previous month", children, ...rest },
    "calendar-previous",
    "btn btn-icon btn-ghost",
  );
}

export function CalendarNextButton(props: CatalogComponentProps): JSX.Element {
  const { children = "Next month", ...rest } = props;
  return buttonPart(
    { "aria-label": "Next month", children, ...rest },
    "calendar-next",
    "btn btn-icon btn-ghost",
  );
}

export function CalendarGrid(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-grid", role: "grid" });
}

export function CalendarHead(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-head", role: "row" });
}

export function CalendarBody(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-body" });
}

export function CalendarRow(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-row", role: "row" });
}

export function CalendarCell(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "calendar-cell", role: "gridcell" });
}

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

export function Carousel(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "carousel" });
}

export function CarouselContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "carousel-content" });
}

export function CarouselItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "carousel-item" });
}

export function CarouselPrevious(props: CatalogComponentProps): JSX.Element {
  const { children = "Previous", ...rest } = props;
  return buttonPart({ children, ...rest }, "carousel-previous", "btn btn-icon");
}

export function CarouselNext(props: CatalogComponentProps): JSX.Element {
  const { children = "Next", ...rest } = props;
  return buttonPart({ children, ...rest }, "carousel-next", "btn btn-icon");
}

export function Combobox(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "combobox" });
}

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

export function ComboboxList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "combobox-list", role: "listbox" });
}

export function ComboboxOption(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "combobox-option", role: "option" });
}

export function Command(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command" });
}

export function CommandDialog(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-dialog" });
}

export function CommandInput(props: CatalogComponentProps): JSX.Element {
  const { ref, class: className, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("input", className),
    "data-slot": "command-input",
  });

  return <input {...finalProps} />;
}

export function CommandHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-header" });
}

export function CommandList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-list", role: "listbox" });
}

export function CommandEmpty(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-empty" });
}

export function CommandGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-group", role: "group" });
}

export function CommandGroupHeading(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-group-heading", element: "div" });
}

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

export function CommandSeparator(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-separator", element: "div", role: "separator" });
}

export function CommandShortcut(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "command-shortcut", element: "span" });
}

export function DataTable(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "data-table" });
}

export function DatePicker(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "date-picker" });
}

export function DatePickerInput(props: CatalogComponentProps): JSX.Element {
  const { ref, class: className, type = "date", ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("input", className),
    "data-slot": "date-picker-input",
  });

  return <input type={type as string} {...finalProps} />;
}

export function Direction(props: CatalogComponentProps & { dir?: "ltr" | "rtl" }): JSX.Element {
  const { dir = "ltr", ...rest } = props;
  return catalogPart({ dir, ...rest }, { slot: "direction" });
}

export function Empty(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty" });
}

export function EmptyHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-header" });
}

export function EmptyTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-title", element: "h3" });
}

export function EmptyDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-description", element: "p" });
}

export function EmptyContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-content" });
}

export function EmptyMedia(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "empty-media" });
}

export function FieldGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-group" });
}

export function FieldSet(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-set", element: "fieldset" });
}

export function FieldLegend(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-legend", element: "legend" });
}

export function FieldLabel(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-label", element: "label", className: "label" });
}

export function FieldDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-description", element: "p", className: "field-hint" });
}

export function FieldContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-content" });
}

export function FieldTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-title", element: "div" });
}

export function FieldSeparator(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "field-separator", role: "separator" });
}

export function InputOTP(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "input-otp", role: "group" });
}

export function InputOTPGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "input-otp-group", role: "group" });
}

export function InputOTPSlot(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "input-otp-slot", element: "span" });
}

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

export function ItemGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-group" });
}

export function ItemHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-header" });
}

export function ItemMedia(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-media" });
}

export function ItemContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-content" });
}

export function ItemTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-title" });
}

export function ItemDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-description" });
}

export function ItemActions(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-actions" });
}

export function ItemFooter(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "item-footer" });
}

export function Kbd(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "kbd", element: "kbd" });
}

export function NativeSelect(props: CatalogComponentProps): JSX.Element {
  const { children, ref, class: className, ...rest } = props;
  const finalProps = mergeProps(rest, {
    ref,
    class: classes("input", className),
    "data-slot": "native-select",
  });

  return <select {...finalProps}>{children}</select>;
}

export function NavigationMenu(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu", element: "nav" });
}

export function NavigationMenuList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-list", element: "ul" });
}

export function NavigationMenuItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-item", element: "li" });
}

export function NavigationMenuTrigger(props: CatalogComponentProps): JSX.Element {
  return buttonPart(props, "navigation-menu-trigger", "nav-item");
}

export function NavigationMenuContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-content" });
}

export function NavigationMenuLink(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-link", element: "a" });
}

export function NavigationMenuViewport(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-viewport" });
}

export function NavigationMenuIndicator(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "navigation-menu-indicator" });
}

export function Pagination(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "pagination", element: "nav", role: "navigation" });
}

export function PaginationContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "pagination-content", element: "ul" });
}

export function PaginationItem(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "pagination-item", element: "li" });
}

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

export function PaginationPrevious(props: CatalogComponentProps): JSX.Element {
  const { children = "Previous", ...rest } = props;
  return catalogPart({ children, ...rest }, { slot: "pagination-previous", element: "a" });
}

export function PaginationNext(props: CatalogComponentProps): JSX.Element {
  const { children = "Next", ...rest } = props;
  return catalogPart({ children, ...rest }, { slot: "pagination-next", element: "a" });
}

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

export function ResizablePanelGroup(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "resizable-panel-group" });
}

export function ResizablePanel(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "resizable-panel" });
}

export function ResizableHandle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "resizable-handle", role: "separator" });
}

export function TabsList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "tabs-list", role: "tablist" });
}

export function TabsTrigger(props: CatalogComponentProps): JSX.Element {
  return buttonPart(props, "tabs-trigger", "tab");
}

export function TabsContent(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "tabs-content", role: "tabpanel" });
}

export function SheetContent(
  props: CatalogComponentProps & {
    side?: "top" | "right" | "bottom" | "left";
  },
): JSX.Element {
  const { side = "right", ...rest } = props;
  return <CatalogDialogContent {...rest} data-side={side} data-slot="sheet-content" />;
}

export function SheetHeader(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sheet-header" });
}

export function SheetFooter(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sheet-footer" });
}

export function SheetTitle(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sheet-title", element: "h2" });
}

export function SheetDescription(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sheet-description", element: "p" });
}

export function Toaster(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "sonner" });
}

export const Sonner = Toaster;

export function Typography(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography" });
}

export function TypographyH1(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h1", element: "h1" });
}

export function TypographyH2(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h2", element: "h2" });
}

export function TypographyH3(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h3", element: "h3" });
}

export function TypographyH4(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-h4", element: "h4" });
}

export function TypographyP(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-p", element: "p" });
}

export function TypographyBlockquote(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-blockquote", element: "blockquote" });
}

export function TypographyList(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-list", element: "ul" });
}

export function TypographyLead(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-lead", element: "p" });
}

export function TypographyMuted(props: CatalogComponentProps): JSX.Element {
  return catalogPart(props, { slot: "typography-muted", element: "p" });
}
