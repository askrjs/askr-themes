import { describe, expect, it } from "vite-plus/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  Button,
  Header,
  Navbar,
  SidebarLayout,
  Stack,
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  TopbarLayout,
} from "../src/components";

const PACKAGE_JSON = join(__dirname, "..", "package.json");
const DEFAULT_INDEX = join(__dirname, "..", "src", "themes", "default", "index.css");
const TEMPLATE_INDEX = join(__dirname, "..", "templates", "theme", "index.css");

describe("package surface", () => {
  it("keeps the reusable shell chrome and theme controls public", () => {
    expect(typeof Button).toBe("function");
    expect(typeof ThemeProvider).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
    expect(typeof Header).toBe("function");
    expect(typeof Navbar).toBe("function");
    expect(typeof SidebarLayout).toBe("function");
    expect(typeof TopbarLayout).toBe("function");
    expect(typeof Stack).toBe("function");
  });

  it("drops recipe shell exports from the package map", () => {
    const pkg = JSON.parse(readFileSync(PACKAGE_JSON, "utf-8")) as {
      exports?: Record<string, unknown>;
    };

    expect(pkg.exports?.["./components"]).toBeTruthy();
    expect(pkg.exports?.["./default/navbar.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/sidebar.css"]).toBeTruthy();
    expect(pkg.exports?.["./default/product-shell.css"]).toBeUndefined();
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
