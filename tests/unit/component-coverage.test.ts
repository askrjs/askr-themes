import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import * as controls from "../../src/controls";
import * as feedback from "../../src/feedback";
import * as layouts from "../../src/layouts";
import * as navs from "../../src/navs";
import * as shells from "../../src/shells";
import * as surfaces from "../../src/surfaces";
import * as theme from "../../src/theme";

import { ROOT_DIR } from "./test-paths";

type CoverageGroup = {
  exports: readonly string[];
  directTests: readonly string[];
  benchFiles: readonly string[];
  benchTier: 2 | 3 | 4;
};

const IGNORED_EXPORTS = {
  controls: ["Button"],
  navs: ["BREADCRUMB_A11Y_CONTRACT"],
  shells: ["HEADER_A11Y_CONTRACT", "SHELL_A11Y_CONTRACT"],
  surfaces: ["SEPARATOR_A11Y_CONTRACT"],
  theme: ["DEFAULT_THEME_OPTIONS"],
} as const;

const COVERAGE = {
  controls: [
    {
      exports: [
        "ButtonGroup",
        "Close",
        "Field",
        "FieldError",
        "FieldHint",
        "InputGroup",
        "InputGroupText",
      ],
      directTests: [
        "tests/unit/theme-aliases.test.ts",
        "tests/unit/components-entrypoint.test.ts",
        "tests/unit/package-surface.test.ts",
      ],
      benchFiles: [
        "benches/tier2/public-families.bench.tsx",
        "benches/tier4/browser-flows.bench.tsx",
      ],
      benchTier: 2,
    },
  ],
  feedback: [
    {
      exports: ["EmptyState", "Spinner"],
      directTests: [
        "tests/unit/components-entrypoint.test.ts",
        "tests/unit/package-surface.test.ts",
        "tests/jsdom/saas-patterns.test.tsx",
        "tests/jsdom/breadcrumb-spinner.test.tsx",
      ],
      benchFiles: [
        "benches/tier2/public-families.bench.tsx",
        "benches/tier4/browser-flows.bench.tsx",
      ],
      benchTier: 2,
    },
  ],
  layouts: [
    {
      exports: [
        "AspectRatio",
        "Block",
        "Box",
        "Container",
        "Flex",
        "Inline",
        "Section",
        "Spacer",
        "Stack",
      ],
      directTests: [
        "tests/jsdom/aspect-ratio.test.tsx",
        "tests/jsdom/block.test.tsx",
        "tests/unit/moved-components.test.ts",
        "tests/unit/components-entrypoint.test.ts",
        "tests/unit/package-surface.test.ts",
      ],
      benchFiles: [
        "benches/tier2/public-families.bench.tsx",
        "benches/tier4/browser-flows.bench.tsx",
      ],
      benchTier: 2,
    },
  ],
  navs: [
    {
      exports: [
        "Breadcrumb",
        "BreadcrumbCurrent",
        "BreadcrumbItem",
        "BreadcrumbLink",
        "BreadcrumbList",
        "BreadcrumbSeparator",
        "Nav",
        "NavBrand",
        "NavGroup",
        "NavItem",
        "NavLink",
        "Pagination",
        "PaginationEllipsis",
        "PaginationItem",
        "PaginationLink",
      ],
      directTests: [
        "tests/unit/navigation-contracts.test.ts",
        "tests/jsdom/breadcrumb-spinner.test.tsx",
        "tests/jsdom/navbar-link.test.tsx",
        "tests/unit/theme-aliases.test.ts",
        "tests/unit/components-entrypoint.test.ts",
      ],
      benchFiles: [
        "benches/tier2/public-families.bench.tsx",
        "benches/tier4/browser-flows.bench.tsx",
      ],
      benchTier: 2,
    },
    {
      exports: ["Navbar", "NavToggle", "Sidebar", "SidebarPanel"],
      directTests: [
        "tests/unit/navigation-contracts.test.ts",
        "tests/jsdom/navbar-shell.test.tsx",
        "tests/unit/shell-edge-components.test.ts",
        "tests/unit/package-surface.test.ts",
        "tests/unit/components-entrypoint.test.ts",
      ],
      benchFiles: ["benches/tier3/composition.bench.tsx", "benches/tier4/browser-flows.bench.tsx"],
      benchTier: 3,
    },
  ],
  shells: [
    {
      exports: [
        "Header",
        "Sidebar",
        "SidebarPanel",
        "SidebarToggle",
        "NavBrand",
        "Navbar",
        "NavGroup",
        "NavItem",
        "NavLink",
        "NavToggle",
        "Shell",
        "ShellMain",
        "ShellNav",
      ],
      directTests: [
        "tests/unit/header-components.test.ts",
        "tests/unit/shell-edge-components.test.ts",
        "tests/unit/themed-layout-wrappers.test.ts",
        "tests/unit/moved-components.test.ts",
        "tests/unit/navigation-contracts.test.ts",
        "tests/jsdom/navbar-shell.test.tsx",
        "tests/unit/components-entrypoint.test.ts",
        "tests/unit/package-surface.test.ts",
      ],
      benchFiles: ["benches/tier3/composition.bench.tsx", "benches/tier4/browser-flows.bench.tsx"],
      benchTier: 3,
    },
  ],
  surfaces: [
    {
      exports: [
        "Alert",
        "Badge",
        "Card",
        "CardActions",
        "CardContent",
        "CardDescription",
        "CardFooter",
        "CardHeader",
        "CardTitle",
        "ListGroup",
        "ListGroupItem",
        "Divider",
        "Separator",
        "Skeleton",
      ],
      directTests: [
        "tests/unit/card-components.test.ts",
        "tests/unit/theme-aliases.test.ts",
        "tests/unit/moved-components.test.ts",
        "tests/unit/components-entrypoint.test.ts",
        "tests/unit/package-surface.test.ts",
      ],
      benchFiles: [
        "benches/tier2/public-families.bench.tsx",
        "benches/tier4/browser-flows.bench.tsx",
      ],
      benchTier: 2,
    },
  ],
  theme: [
    {
      exports: [
        "CAT_THEME_NAMES",
        "CAT_THEME_OPTIONS",
        "ThemePicker",
        "ThemeProvider",
        "ThemeToggle",
        "useTheme",
      ],
      directTests: [
        "tests/browser/theme-route-persistence.browser.test.tsx",
        "tests/jsdom/theme-contract.test.tsx",
        "tests/jsdom/theme-route-persistence.test.tsx",
        "tests/unit/package-surface.test.ts",
        "tests/unit/components-entrypoint.test.ts",
      ],
      benchFiles: ["benches/tier3/composition.bench.tsx", "benches/tier4/browser-flows.bench.tsx"],
      benchTier: 3,
    },
  ],
} as const satisfies Record<string, readonly CoverageGroup[]>;

function assertFileExists(relativePath: string, message: string): void {
  expect(existsSync(join(ROOT_DIR, relativePath)), message).toBe(true);
}

function moduleExports(namespace: Record<string, unknown>, ignored: readonly string[]): string[] {
  return Object.keys(namespace)
    .filter((name) => !ignored.includes(name))
    .sort();
}

function assertCoverage(
  moduleName: string,
  namespace: Record<string, unknown>,
  ignored: readonly string[],
  groups: readonly CoverageGroup[],
): void {
  const expectedExports = [...new Set(groups.flatMap((group) => group.exports))].sort();
  const actualExports = moduleExports(namespace, ignored);

  expect(actualExports, `${moduleName} exports drifted from the coverage matrix`).toEqual(
    expectedExports,
  );

  for (const group of groups) {
    expect(group.directTests.length, `${moduleName} group has no direct tests`).toBeGreaterThan(0);
    expect(group.benchFiles.length, `${moduleName} group has no bench files`).toBeGreaterThan(0);

    for (const testFile of group.directTests) {
      assertFileExists(testFile, `${moduleName} missing direct test file ${testFile}`);
    }

    for (const benchFile of group.benchFiles) {
      assertFileExists(benchFile, `${moduleName} missing bench file ${benchFile}`);
    }
  }
}

describe("component coverage matrix", () => {
  it("keeps the controls family covered by direct tests and tier2 benches", () => {
    assertCoverage("controls", controls, IGNORED_EXPORTS.controls, COVERAGE.controls);
  });

  it("keeps the feedback family covered by direct tests and tier2 benches", () => {
    assertCoverage("feedback", feedback, [], COVERAGE.feedback);
  });

  it("keeps the layouts family covered by direct tests and tier2 benches", () => {
    assertCoverage("layouts", layouts, [], COVERAGE.layouts);
  });

  it("keeps the nav family covered by direct tests and the correct bench tiers", () => {
    assertCoverage("navs", navs, IGNORED_EXPORTS.navs, COVERAGE.navs);
  });

  it("keeps the shell family covered by direct tests and the correct bench tiers", () => {
    assertCoverage("shells", shells, IGNORED_EXPORTS.shells, COVERAGE.shells);
  });

  it("keeps the surfaces family covered by direct tests and tier2 benches", () => {
    assertCoverage("surfaces", surfaces, IGNORED_EXPORTS.surfaces, COVERAGE.surfaces);
  });

  it("keeps the theme family covered by direct tests and tier3 benches", () => {
    assertCoverage("theme", theme, IGNORED_EXPORTS.theme, COVERAGE.theme);
  });
});
