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
  Checkbox,
  Close,
  Field,
  FieldError,
  FieldHint,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Select,
  Switch,
  Textarea,
} from "../../src/controls";
import {
  Breadcrumb,
  Pill,
  Pills,
  Pagination,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
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
  CardActions,
  Progress,
  ProgressCircle,
  Separator,
  Skeleton,
  Spinner,
  Table,
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
const REMOVED_CARD_CSS_EXPORT = ["./default/card", "css"].join(".");
const REMOVED_BUTTON_CSS_EXPORT = ["./default/button", "css"].join(".");
const REMOVED_LIST_CSS_EXPORT = ["./default/list", "group.css"].join("-");
const REMOVED_CAT_PRESETS_EXPORT = ["./cat", "presets"].join("-");
const A11Y_EXPORT_PATTERN = new RegExp(
  `${["A11Y", "CONTRACT"].join("_")}|${["A11y", "Contract"].join("")}`,
);

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
      Checkbox,
      Close,
      Field,
      FieldHint,
      FieldError,
      Input,
      InputGroup,
      InputGroupText,
      Label,
      Select,
      Switch,
      Textarea,
      Alert,
      AspectRatio,
      Avatar,
      Separator,
      Skeleton,
      Spinner,
      Progress,
      ProgressCircle,
      Breadcrumb,
      Tabs,
      Tab,
      Pills,
      Pill,
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
      Toast,
      Badge,
      Card,
      CardActions,
      Table,
    ]) {
      expect(typeof component).toBe("function");
    }

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
    expect(pkg.exports?.[REMOVED_CAT_PRESETS_EXPORT]).toBeUndefined();
    expect(pkg.exports?.["./layouts"]).toBeUndefined();
    expect(pkg.exports?.["./shells"]).toBeUndefined();
    expect(pkg.exports?.["./components"]).toBeUndefined();
    expect(pkg.exports?.["./default/tokens.css"]).toBe("./src/themes/default/tokens.css");
    expect(pkg.exports?.[REMOVED_CARD_CSS_EXPORT]).toBeUndefined();
    expect(pkg.exports?.[REMOVED_BUTTON_CSS_EXPORT]).toBeUndefined();
    expect(pkg.exports?.[REMOVED_LIST_CSS_EXPORT]).toBeUndefined();
  });

  it("should keeps accessibility contracts out of app-facing barrels", () => {
    const barrels = [
      "src/core.ts",
      "src/controls.ts",
      "src/navs.ts",
      "src/overlays.ts",
      "src/surfaces.ts",
      "src/components/badge/index.ts",
      "src/components/block/index.ts",
      "src/components/breadcrumb/index.ts",
      "src/components/container/index.ts",
      "src/components/header/index.ts",
      "src/components/section/index.ts",
      "src/components/separator/index.ts",
      "src/components/skeleton/index.ts",
    ];

    for (const barrel of barrels) {
      const source = readFileSync(join(ROOT_DIR, barrel), "utf-8");

      expect(source, `${barrel} should not re-export internal contract details`).not.toMatch(
        A11Y_EXPORT_PATTERN,
      );
    }
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

    for (const entrypoint of ["./presets"] as const) {
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
