import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import {
  Aside,
  Block,
  Container,
  EmptyState,
  Header,
  Main,
  Navbar,
  NavBrand,
  NavDropdown,
  NavGroup,
  NavItem,
  NavLink,
  Page,
  PageHeader,
  Section,
  Sidebar,
  Toolbar,
} from "../../src/core";
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
import {
  Breadcrumb,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "../../src/navs";
import {
  ALERT_DIALOG_A11Y_CONTRACT,
  AlertDialog,
  DIALOG_A11Y_CONTRACT,
  Dialog,
  DROPDOWN_A11Y_CONTRACT,
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownTrigger,
  HoverCard,
  MENUBAR_A11Y_CONTRACT,
  MENU_A11Y_CONTRACT,
  Menu,
  Menubar,
  POPOVER_A11Y_CONTRACT,
  Popover,
  TOAST_A11Y_CONTRACT,
  TOOLTIP_A11Y_CONTRACT,
  Toast,
  Tooltip,
} from "../../src/overlays";
import {
  Alert,
  AspectRatio,
  Badge,
  Card,
  CardActions,
  ListGroup,
  ListGroupItem,
  SEPARATOR_A11Y_CONTRACT,
  Spinner,
} from "../../src/surfaces";
import { ThemePicker, ThemeProvider, ThemeToggle } from "../../src/theme";
import {
  DEFAULT_THEME_INDEX_FILE,
  PACKAGE_JSON,
  ROOT_DIR,
  TEMPLATE_THEME_INDEX_FILE,
} from "./test-paths";

const DEFAULT_INDEX = DEFAULT_THEME_INDEX_FILE;
const TEMPLATE_INDEX = TEMPLATE_THEME_INDEX_FILE;

describe("package surface", () => {
  it("should exposes the block-first core and curated visual families", () => {
    for (const component of [
      Block,
      Container,
      Header,
      Main,
      Section,
      Aside,
      Sidebar,
      Navbar,
      NavBrand,
      NavDropdown,
      NavGroup,
      NavItem,
      NavLink,
      Page,
      PageHeader,
      Toolbar,
      EmptyState,
      Button,
      ThemeProvider,
      ThemePicker,
      ThemeToggle,
      ButtonGroup,
      Close,
      Field,
      FieldHint,
      FieldError,
      InputGroup,
      InputGroupText,
      Alert,
      AspectRatio,
      Spinner,
      Breadcrumb,
      Pagination,
      PaginationItem,
      PaginationLink,
      PaginationEllipsis,
      Dialog,
      AlertDialog,
      Dropdown,
      DropdownTrigger,
      DropdownContent,
      DropdownItem,
      Popover,
      Tooltip,
      HoverCard,
      Toast,
      Menu,
      Menubar,
      ListGroup,
      ListGroupItem,
      Badge,
      Card,
      CardActions,
    ]) {
      expect(typeof component).toBe("function");
    }

    expect(DIALOG_A11Y_CONTRACT).toBeTruthy();
    expect(ALERT_DIALOG_A11Y_CONTRACT).toBeTruthy();
    expect(DROPDOWN_A11Y_CONTRACT).toBeTruthy();
    expect(POPOVER_A11Y_CONTRACT).toBeTruthy();
    expect(TOOLTIP_A11Y_CONTRACT).toBeTruthy();
    expect(TOAST_A11Y_CONTRACT).toBeTruthy();
    expect(MENU_A11Y_CONTRACT).toBeTruthy();
    expect(MENUBAR_A11Y_CONTRACT).toBeTruthy();
    expect(SEPARATOR_A11Y_CONTRACT).toBeTruthy();
  });

  it("should publishes curated entrypoints without a components catch-all", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./core"]).toBeTruthy();
    expect(pkg.exports?.["./theme"]).toBeTruthy();
    expect(pkg.exports?.["./controls"]).toBeTruthy();
    expect(pkg.exports?.["./surfaces"]).toBeTruthy();
    expect(pkg.exports?.["./feedback"]).toBeUndefined();
    expect(pkg.exports?.["./navs"]).toBeTruthy();
    expect(pkg.exports?.["./overlays"]).toBeTruthy();
    expect(pkg.exports?.["./presets"]).toBe("./src/themes/presets/index.css");
    expect(pkg.exports?.["./cat-presets"]).toBe("./src/themes/presets/index.css");
    expect(pkg.exports?.["./layouts"]).toBeUndefined();
    expect(pkg.exports?.["./shells"]).toBeUndefined();
    expect(pkg.exports?.["./components"]).toBeUndefined();
  });

  it("should keeps NavItem as a single link preset without dead variants", () => {
    const navTypes = readFileSync(join(ROOT_DIR, "src/components/nav/nav.types.ts"), "utf-8");
    const navIndex = readFileSync(join(ROOT_DIR, "src/components/nav/index.ts"), "utf-8");
    const navbarIndex = readFileSync(join(ROOT_DIR, "src/components/navbar/index.ts"), "utf-8");

    for (const source of [navTypes, navIndex, navbarIndex]) {
      expect(source).not.toContain("NavItemVariant");
    }

    expect(navTypes).not.toMatch(/NavItemOwnProps[^{]*{[^}]*variant\?/s);
  });

  it("should keeps Block as the only public layout vocabulary", () => {
    const removedLayoutHelper = join(ROOT_DIR, "src/components/_internal", "layout.ts");
    const visualAudit = readFileSync(join(ROOT_DIR, "visual-check.html"), "utf-8");
    const readme = readFileSync(join(ROOT_DIR, "docs/README.md"), "utf-8");
    const guide = readFileSync(join(ROOT_DIR, "docs/askr-themes.md"), "utf-8");
    const forbiddenBreakpoint = ["initial", ":"].join("");
    const forbiddenSlot = (slot: string) => `data-slot="${slot}"`;

    expect(existsSync(removedLayoutHelper)).toBe(false);

    for (const source of [visualAudit, readme, guide]) {
      expect(source).not.toContain(forbiddenBreakpoint);
      expect(source).not.toContain(forbiddenSlot("stack"));
      expect(source).not.toContain(forbiddenSlot("flex"));
    }
  });

  it("should keeps EmptyState owned by core and Spinner owned by surfaces", () => {
    const coreEntrypoint = readFileSync(join(ROOT_DIR, "src/core.ts"), "utf-8");
    const surfacesEntrypoint = readFileSync(join(ROOT_DIR, "src/surfaces.ts"), "utf-8");
    const feedbackEntrypoint = join(ROOT_DIR, "src/feedback.ts");

    expect(coreEntrypoint).toContain('export { EmptyState } from "./components/empty-state";');
    expect(surfacesEntrypoint).toContain('export { Spinner } from "./components/spinner";');
    expect(coreEntrypoint).not.toContain("Spinner");
    expect(existsSync(feedbackEntrypoint)).toBe(false);
  });

  it("should keeps default CSS package exports pointed at real files", () => {
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

  it("should keeps preset CSS package exports pointed at real files", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    for (const entrypoint of ["./presets", "./cat-presets"] as const) {
      const target = pkg.exports?.[entrypoint];

      expect(typeof target).toBe("string");
      expect(
        existsSync(join(ROOT_DIR, target as string)),
        `${entrypoint} points at ${target}`,
      ).toBe(true);
    }
  });

  it("should does not wire recipe layout imports into the shipped bundles", () => {
    const defaultIndex = readFileSync(DEFAULT_INDEX, "utf-8");
    const templateIndex = readFileSync(TEMPLATE_INDEX, "utf-8");

    for (const source of [defaultIndex, templateIndex]) {
      expect(source).not.toContain("marketing-shell.css");
      expect(source).not.toContain("product-shell.css");
    }
  });
});
