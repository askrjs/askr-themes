import { describe, expect, it } from "vite-plus/test";

import { Button, ButtonGroup, Close, InputGroup, InputGroupText } from "../../src/controls";
import {
  Aside,
  Block,
  Container,
  EmptyState,
  Header,
  Main,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavItem,
  NavLink,
  Navbar,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Toolbar,
} from "../../src/core";
import {
  Breadcrumb,
  Nav,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "../../src/navs";
import {
  AlertDialog,
  Dialog,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  HoverCard,
  Menu,
  Menubar,
  Popover,
  Toast,
  Tooltip,
} from "../../src/overlays";
import {
  Alert,
  AspectRatio,
  Badge,
  Card,
  ListGroup,
  ListGroupItem,
  Spinner,
} from "../../src/surfaces";
import {
  CAT_THEME_NAMES,
  CAT_THEME_OPTIONS,
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "../../src/theme";

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

  it("should exposes core, surface, nav, and overlay families", () => {
    expect(AspectRatio({ ratio: 16 / 9, children: "hero" })).toBeTruthy();
    expect(Block({ children: "block", gap: "md" })).toBeTruthy();
    expect(Container({ children: "container" })).toBeTruthy();
    expect(Section({ children: "section" })).toBeTruthy();
    expect(Page({ children: "page" })).toBeTruthy();
    expect(PageHeader({ title: "Projects" })).toBeTruthy();
    expect(Toolbar({ title: "Projects" })).toBeTruthy();
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
    expect(EmptyState({ title: "No projects" })).toBeTruthy();
    expect(Header({ children: "header" })).toBeTruthy();
    expect(Main({ children: "main" })).toBeTruthy();
    expect(Aside({ children: "aside" })).toBeTruthy();
    expect(Sidebar({ children: "sidebar" })).toBeTruthy();
    expect(Navbar({ children: "navbar" })).toBeTruthy();
    expect(Navbar({ collapseAt: "md", children: "navbar" })).toBeTruthy();
    expect(NavBrand({ children: "Askr" })).toBeTruthy();
    expect(NavBrand({ as: "a", href: "/", children: "Askr" })).toBeTruthy();
    expect(NavDropdown({ label: "More", children: "items" })).toBeTruthy();
    expect(NavGroup({ title: "Workspace", children: "group" })).toBeTruthy();
    expect(NavItem({ href: "https://github.com/askrjs", children: "item" })).toBeTruthy();
    expect(NavLink({ href: "/docs", children: "link" })).toBeTruthy();
    expect(Pagination({ children: "pages" })).toBeTruthy();
    expect(PaginationEllipsis({})).toBeTruthy();
    expect(PaginationItem({ children: "item" })).toBeTruthy();
    expect(PaginationLink({ href: "/docs", children: "page 1" })).toBeTruthy();
    expect(typeof Dialog).toBe("function");
    expect(typeof AlertDialog).toBe("function");
    expect(typeof Dropdown).toBe("function");
    expect(typeof DropdownTrigger).toBe("function");
    expect(typeof DropdownContent).toBe("function");
    expect(typeof DropdownItem).toBe("function");
    expect(typeof Popover).toBe("function");
    expect(typeof Tooltip).toBe("function");
    expect(typeof HoverCard).toBe("function");
    expect(typeof Toast).toBe("function");
    expect(typeof Menu).toBe("function");
    expect(typeof Menubar).toBe("function");
    expect(ListGroup({ children: "list" })).toBeTruthy();
    expect(ListGroupItem({ children: "row" })).toBeTruthy();
  });
});
