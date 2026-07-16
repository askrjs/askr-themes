import { describe, expect, it } from "vite-plus/test";

import {
  Alert,
  AlertDescription,
  AlertTitle,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  Button,
  Brand,
  BrandLabel,
  BrandMark,
  Calendar,
  CalendarDay,
  CalendarHeader,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Carousel,
  Checkbox,
  Combobox,
  Command,
  CommandGroupHeading,
  CommandItem,
  DataTable,
  DatePicker,
  Dialog,
  Drawer,
  DropdownMenu,
  Empty,
  Field,
  Form,
  Grid,
  Input,
  InputOTP,
  Item,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  Kbd,
  NativeSelect,
  NavigationMenu,
  Pagination,
  Popover,
  ResizablePanelGroup,
  Select,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarScope,
  SidebarTrigger,
  Sonner,
  Skeleton,
  Spinner,
  Stat,
  StatDescription,
  StatLabel,
  StatValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ThemeScope,
  Tooltip,
  Typography,
  Text,
} from "../../src/components";

type ElementLike = {
  props: Record<string, unknown>;
  type: unknown;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("components entrypoint", () => {
  it("should exposes styled components and behavior primitives from one catalog", () => {
    for (const component of [
      Alert,
      Brand,
      Button,
      Calendar,
      Card,
      Carousel,
      Checkbox,
      Combobox,
      Command,
      DataTable,
      DatePicker,
      Dialog,
      Drawer,
      DropdownMenu,
      Empty,
      Field,
      Form,
      Grid,
      Input,
      InputOTP,
      Item,
      Kbd,
      NativeSelect,
      NavigationMenu,
      Pagination,
      Popover,
      ResizablePanelGroup,
      Select,
      Sheet,
      Sidebar,
      Skeleton,
      Sonner,
      Stat,
      Tabs,
      ThemeScope,
      Tooltip,
      Typography,
      Text,
    ]) {
      expect(typeof component).toBe("function");
    }
  });

  it("should renders new catalog-only anatomy with stable slots", () => {
    expect(asElement(AlertTitle({ children: "Heads up" })).props["data-slot"]).toBe("alert-title");
    expect(asElement(AlertDescription({ children: "Details" })).props["data-slot"]).toBe(
      "alert-description",
    );
    expect(
      asElement(Brand({ children: [BrandMark({}), BrandLabel({ children: "Brand" })] })).props[
        "data-slot"
      ],
    ).toBe("brand");
    expect(asElement(Grid({ columns: 2, children: "Grid" })).props["data-slot"]).toBe("grid");
    expect(asElement(Breadcrumb({ children: BreadcrumbList({}) })).props["data-slot"]).toBe(
      "breadcrumb",
    );
    expect(
      asElement(BreadcrumbItem({ children: BreadcrumbLink({ href: "/", children: "Home" }) }))
        .props["data-slot"],
    ).toBe("breadcrumb-item");
    expect(
      asElement(CardHeader({ children: CardTitle({ children: "Usage" }) })).props["data-slot"],
    ).toBe("card-header");
    expect(asElement(CardContent({ children: "Body" })).props["data-slot"]).toBe("card-content");
    expect(
      asElement(TabsList({ children: TabsTrigger({ children: "Preview" }) })).props["data-slot"],
    ).toBe("tabs-list");
    expect(asElement(TabsContent({ children: "Panel" })).props["data-slot"]).toBe("tabs-content");
    expect(asElement(CalendarHeader({ children: "June" })).props["data-slot"]).toBe(
      "calendar-header",
    );
    expect(asElement(CalendarDay({ children: "26", selected: true })).props["data-selected"]).toBe(
      "true",
    );
    expect(asElement(CommandGroupHeading({ children: "Suggestions" })).props["data-slot"]).toBe(
      "command-group-heading",
    );
    expect(
      asElement(CommandItem({ children: "Calendar", selected: true })).props["aria-selected"],
    ).toBe("true");
    expect(
      asElement(ItemGroup({ children: ItemHeader({ children: "Header" }) })).props["data-slot"],
    ).toBe("item-group");
    expect(asElement(ItemFooter({ children: "Footer" })).props["data-slot"]).toBe("item-footer");
    expect(asElement(SheetContent({ children: "Panel", side: "left" })).props["data-slot"]).toBe(
      "sheet-content",
    );
    expect(
      asElement(SheetHeader({ children: SheetTitle({ children: "Settings" }) })).props["data-slot"],
    ).toBe("sheet-header");
    expect(asElement(SheetDescription({ children: "Details" })).props["data-slot"]).toBe(
      "sheet-description",
    );
    expect(asElement(SheetFooter({ children: "Done" })).props["data-slot"]).toBe("sheet-footer");
    expect(
      asElement(SidebarScope({ children: SidebarInset({ children: "Main" }) })).props[
        "data-slot"
      ],
    ).toBe("sidebar-scope");
    expect(asElement(SidebarContent({ children: SidebarGroup({}) })).props["data-slot"]).toBe(
      "sidebar-content",
    );
    expect(asElement(SidebarGroupLabel({ children: "Platform" })).props["data-slot"]).toBe(
      "sidebar-group-label",
    );
    expect(asElement(SidebarMenu({ children: SidebarMenuItem({}) })).props["data-slot"]).toBe(
      "sidebar-menu",
    );
    expect(
      asElement(SidebarMenuButton({ children: "Dashboard", active: true })).props["data-active"],
    ).toBe("true");
    expect(
      asElement(
        SidebarMenuButton({
          children: "Docs",
          tooltip: "Docs",
          tooltipSide: "right",
        }),
      ).props["data-tooltip-side"],
    ).toBe("right");
    expect(
      asElement(SidebarTrigger({ children: "Collapse", tooltip: "Collapse", tooltipSide: "left" }))
        .props["data-tooltip"],
    ).toBe("Collapse");
    const skeleton = asElement(Skeleton({ height: 12, width: "8rem" }));

    expect(skeleton.props["data-slot"]).toBe("skeleton");
    expect(String(skeleton.props.class)).toContain("ak-style-");
    const spinner = asElement(Spinner({ label: "Loading", size: "sm" }));

    expect(spinner.props["data-spinner"]).toBe("true");
    expect(spinner.props["data-size"]).toBe("sm");
    expect(spinner.props.value).toBeNull();
    expect(spinner.props.children).toBeTruthy();
    expect(asElement(Stat({ children: StatValue({ children: "12" }) })).props["data-slot"]).toBe(
      "stat",
    );
    expect(asElement(StatLabel({ children: "Label" })).props["data-slot"]).toBe("stat-label");
    expect(asElement(StatDescription({ children: "Details" })).props["data-slot"]).toBe(
      "stat-description",
    );
    const text = asElement(
      Text({
        tone: "info",
        font: "mono",
        numeric: "tabular",
        wrap: "anywhere",
        truncate: true,
        children: "Copy",
      }),
    );

    expect(text.props["data-slot"]).toBe("text");
    expect(text.props["data-tone"]).toBe("info");
    expect(text.props["data-font"]).toBe("mono");
    expect(text.props["data-numeric"]).toBe("tabular");
    expect(text.props["data-wrap"]).toBe("anywhere");
    expect(text.props["data-truncate"]).toBe("true");
  });
});
