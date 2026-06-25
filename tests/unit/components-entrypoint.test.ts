import { describe, expect, it } from "vite-plus/test";

import {
  Button,
  ButtonGroup,
  Checkbox,
  Close,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Select,
  Switch,
  Textarea,
} from "../../src/controls";
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
  Pill,
  Pills,
  Tab,
  Tabs,
} from "../../src/navs";
import {
  AlertDialog,
  Dialog,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  Popover,
  Toast,
  Tooltip,
} from "../../src/overlays";
import {
  Alert,
  AspectRatio,
  Avatar,
  Badge,
  Card,
  Progress,
  ProgressCircle,
  Spinner,
  Table,
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
    expect(typeof Checkbox).toBe("function");
    expect(typeof Input).toBe("function");
    expect(InputGroup({ children: "input-group" })).toBeTruthy();
    expect(InputGroupText({ children: "USD" })).toBeTruthy();
    expect(typeof Label).toBe("function");
    expect(typeof Select).toBe("function");
    expect(typeof Switch).toBe("function");
    expect(typeof Textarea).toBe("function");
    expect(Alert({ title: "Notice" })).toBeTruthy();
    expect(typeof Avatar).toBe("function");
    expect(Badge({ children: "new" })).toBeTruthy();
    expect(Card({ children: "body" })).toBeTruthy();
    expect(Tabs({ children: Tab({ href: "/settings/profile", children: "Profile" }) })).toBeTruthy();
    expect(Pills({ children: Pill({ href: "/settings/profile", children: "Profile" }) })).toBeTruthy();
    expect(typeof Progress).toBe("function");
    expect(typeof ProgressCircle).toBe("function");
    expect(Spinner({ label: "Working" })).toBeTruthy();
    expect(typeof Table).toBe("function");
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
    expect(typeof Dialog).toBe("function");
    expect(typeof AlertDialog).toBe("function");
    expect(typeof Dropdown).toBe("function");
    expect(typeof DropdownTrigger).toBe("function");
    expect(typeof DropdownContent).toBe("function");
    expect(typeof DropdownItem).toBe("function");
    expect(typeof Popover).toBe("function");
    expect(typeof Tooltip).toBe("function");
    expect(typeof Toast).toBe("function");
  });
});
