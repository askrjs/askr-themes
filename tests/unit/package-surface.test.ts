import { describe, expect, it } from "vite-plus/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  Button,
  ButtonGroup,
  Close,
  Field,
  FieldError,
  FieldHint,
  InputGroup,
  InputGroupText,
} from "../../src/controls";
import { Alert, Badge, Card, CardActions, ListGroup, ListGroupItem } from "../../src/surfaces";
import { ThemePicker, ThemeProvider, ThemeToggle } from "../../src/theme";
import { Block, Container, Section, Stack as LayoutStack } from "../../src/layouts";
import {
  Header,
  HEADER_A11Y_CONTRACT,
  SHELL_A11Y_CONTRACT,
  Shell,
  ShellMain,
  ShellNav,
  Sidebar as ShellSidebar,
  SidebarPanel as ShellSidebarPanel,
} from "../../src/shells";
import {
  BREADCRUMB_A11Y_CONTRACT,
  Navbar,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  Sidebar,
  SidebarPanel,
} from "../../src/navs";
import {
  Shell as BarrelShell,
  ShellMain as BarrelShellMain,
  ShellNav as BarrelShellNav,
} from "../../src/shells";
import { SEPARATOR_A11Y_CONTRACT } from "../../src/surfaces";

import {
  DEFAULT_THEME_INDEX_FILE,
  PACKAGE_JSON,
  ROOT_DIR,
  TEMPLATE_THEME_INDEX_FILE,
} from "./test-paths";

const DEFAULT_INDEX = DEFAULT_THEME_INDEX_FILE;
const TEMPLATE_INDEX = TEMPLATE_THEME_INDEX_FILE;

describe("package surface", () => {
  it("keeps the reusable shell chrome and theme controls public", () => {
    expect(typeof Button).toBe("function");
    expect(typeof ThemeProvider).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
    expect(typeof ButtonGroup).toBe("function");
    expect(typeof Close).toBe("function");
    expect(typeof Field).toBe("function");
    expect(typeof FieldHint).toBe("function");
    expect(typeof FieldError).toBe("function");
    expect(typeof InputGroup).toBe("function");
    expect(typeof InputGroupText).toBe("function");
    expect(typeof Alert).toBe("function");
    expect(typeof Header).toBe("function");
    expect(typeof Navbar).toBe("function");
    expect(typeof Sidebar).toBe("function");
    expect(typeof SidebarPanel).toBe("function");
    expect(typeof Pagination).toBe("function");
    expect(typeof PaginationItem).toBe("function");
    expect(typeof PaginationLink).toBe("function");
    expect(typeof PaginationEllipsis).toBe("function");
    expect(typeof Shell).toBe("function");
    expect(typeof ShellNav).toBe("function");
    expect(typeof ShellMain).toBe("function");
    expect(typeof BarrelShell).toBe("function");
    expect(typeof BarrelShellNav).toBe("function");
    expect(typeof BarrelShellMain).toBe("function");
    expect(typeof ShellSidebar).toBe("function");
    expect(typeof ShellSidebarPanel).toBe("function");
    expect(typeof ListGroup).toBe("function");
    expect(typeof ListGroupItem).toBe("function");
    expect(typeof Block).toBe("function");
    expect(typeof Container).toBe("function");
    expect(typeof Section).toBe("function");
    expect(typeof LayoutStack).toBe("function");
    expect(typeof Badge).toBe("function");
    expect(typeof Card).toBe("function");
    expect(typeof CardActions).toBe("function");
    expect(BREADCRUMB_A11Y_CONTRACT).toBeTruthy();
    expect(HEADER_A11Y_CONTRACT).toBeTruthy();
    expect(SHELL_A11Y_CONTRACT).toBeTruthy();
    expect(SEPARATOR_A11Y_CONTRACT).toBeTruthy();
  });

  it("publishes curated entrypoints instead of a components catch-all", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./theme"]).toBeTruthy();
    expect(pkg.exports?.["./controls"]).toBeTruthy();
    expect(pkg.exports?.["./layouts"]).toBeTruthy();
    expect(pkg.exports?.["./surfaces"]).toBeTruthy();
    expect(pkg.exports?.["./feedback"]).toBeTruthy();
    expect(pkg.exports?.["./shells"]).toBeTruthy();
    expect(pkg.exports?.["./navs"]).toBeTruthy();
    expect(pkg.exports?.["./logos"]).toBeUndefined();
    expect(pkg.exports?.["./components"]).toBeUndefined();
    expect(pkg.exports?.["./default/navbar.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/button-group.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/alert.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/field.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/input-group.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/list-group.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/pagination.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/navigation-menu.css"]).toBeUndefined();
    expect(pkg.exports?.["./default/sidebar.css"]).toBeUndefined();
    expect(pkg.exports?.["./default/docs-layout.css"]).toBeUndefined();
    expect(pkg.exports?.["./default/product-shell.css"]).toBeUndefined();
  });

  it("keeps default CSS package exports pointed at real files", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    for (const [entrypoint, target] of Object.entries(pkg.exports ?? {})) {
      if (!entrypoint.startsWith("./default/") || typeof target !== "string") {
        continue;
      }

      expect(existsSync(join(ROOT_DIR, target)), `${entrypoint} points at ${target}`).toBe(true);
    }
  });

  it("does not wire recipe shell imports into the shipped bundles", () => {
    const defaultIndex = readFileSync(DEFAULT_INDEX, "utf-8");
    const templateIndex = readFileSync(TEMPLATE_INDEX, "utf-8");

    for (const source of [defaultIndex, templateIndex]) {
      expect(source).not.toContain("marketing-shell.css");
      expect(source).not.toContain("product-shell.css");
    }
  });
});
