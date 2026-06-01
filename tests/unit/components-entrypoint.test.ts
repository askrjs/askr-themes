import { describe, expect, it } from "vite-plus/test";

import { Button, ButtonGroup, Close, InputGroup, InputGroupText } from "../../src/controls";
import { EmptyState, Spinner } from "../../src/feedback";
import { Block, Stack, AspectRatio } from "../../src/layouts";
import {
  Breadcrumb,
  Nav,
  NavBrand,
  NavGroup,
  NavItem,
  NavLink,
  Navbar,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  Sidebar,
  SidebarPanel,
} from "../../src/navs";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  Menu,
  Menubar,
} from "../../src/overlays";
import { Alert, Badge, Card, ListGroup, ListGroupItem } from "../../src/surfaces";
import { Header } from "../../src/shells";
import {
  CAT_THEME_NAMES,
  CAT_THEME_OPTIONS,
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "../../src/theme";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("curated entrypoints", () => {
  it("should exposes theme and control families", () => {
    expect(typeof Button).toBe("function");
    expect(typeof ThemeProvider).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
    expect(typeof useTheme).toBe("function");
    expect(CAT_THEME_NAMES).toEqual(["tabby", "ginger", "tuxedo", "calico", "torty"]);
    expect(CAT_THEME_OPTIONS.map((option) => option.value)).toEqual(CAT_THEME_NAMES);
  });

  it("should exposes layout, surface, feedback, nav, and shell families", () => {
    expect(AspectRatio({ ratio: 16 / 9, children: "hero" })).toBeTruthy();
    expect(Block({ children: "block", gap: "2" })).toBeTruthy();
    expect(Stack({ children: "stack", gap: "2" })).toBeTruthy();
    expect(ButtonGroup({ children: "group" })).toBeTruthy();
    expect(Close({ children: "x" })).toBeTruthy();
    expect(InputGroup({ children: "input-group" })).toBeTruthy();
    expect(InputGroupText({ children: "USD" })).toBeTruthy();
    expect(Alert({ title: "Notice" })).toBeTruthy();
    expect(Badge({ children: "new" })).toBeTruthy();
    expect(Card({ children: "body" })).toBeTruthy();
    expect(Breadcrumb({ children: "trail" })).toBeTruthy();
    expect(Nav({ children: "nav" })).toBeTruthy();
    expect(Spinner({ label: "Working" })).toBeTruthy();
    expect(Header({ children: "header" })).toBeTruthy();
    expect(typeof Navbar).toBe("function");
    expect(typeof Sidebar).toBe("function");
    expect(typeof SidebarPanel).toBe("function");
    expect(NavBrand({ children: "brand" })).toBeTruthy();
    expect(NavGroup({ children: "group" })).toBeTruthy();
    expect(NavItem({ href: "https://github.com/askrjs", children: "item" })).toBeTruthy();
    expect(NavLink({ href: "/docs", children: "link" })).toBeTruthy();
    expect(Pagination({ children: "pages" })).toBeTruthy();
    expect(PaginationEllipsis({})).toBeTruthy();
    expect(PaginationItem({ children: "item" })).toBeTruthy();
    expect(PaginationLink({ href: "/docs", children: "page 1" })).toBeTruthy();
    expect(typeof Dropdown).toBe("function");
    expect(typeof DropdownTrigger).toBe("function");
    expect(typeof DropdownContent).toBe("function");
    expect(typeof DropdownItem).toBe("function");
    expect(typeof Menu).toBe("function");
    expect(typeof Menubar).toBe("function");
    expect(ListGroup({ children: "list" })).toBeTruthy();
    expect(ListGroupItem({ children: "row" })).toBeTruthy();
    expect(EmptyState({ title: "No projects" })).toBeTruthy();
  });

  it("should lets the empty state override heading level", () => {
    const emptyState = asElement(EmptyState({ title: "No projects", titleAs: "h3" }));

    expect((emptyState.props.children as ElementLike[])[1].type).toBe("h3");
  });
});
