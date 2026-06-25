import { existsSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vite-plus/test";

import * as controls from "../../src/controls";
import * as core from "../../src/core";
import * as navs from "../../src/navs";
import * as overlays from "../../src/overlays";
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
  controls: [],
  navs: ["BREADCRUMB_A11Y_CONTRACT"],
  overlays: [],
  surfaces: [],
  theme: ["DEFAULT_THEME_OPTIONS"],
} as const;

const COVERAGE = {
  core: [
    {
      exports: [
        "Aside",
        "Block",
        "Container",
        "EmptyState",
        "Header",
        "Main",
        "Navbar",
        "NavBrand",
        "NavDropdown",
        "NavGroup",
        "NavItem",
        "NavLink",
        "Page",
        "PageHeader",
        "Section",
        "Sidebar",
        "Toolbar",
      ],
      directTests: [
        "tests/unit/block-first-components.test.ts",
        "tests/unit/navigation-contracts.test.ts",
        "tests/unit/components-entrypoint.test.ts",
        "tests/unit/package-surface.test.ts",
      ],
      benchFiles: [
        "benches/tier2/public-families.bench.tsx",
        "benches/tier3/composition.bench.tsx",
        "benches/tier4/browser-flows.bench.tsx",
      ],
      benchTier: 2,
    },
  ],
  controls: [
    {
      exports: [
        "BUTTON_A11Y_CONTRACT",
        "Button",
        "ButtonGroup",
        "CHECKBOX_A11Y_CONTRACT",
        "Checkbox",
        "Close",
        "DebouncedInput",
        "Field",
        "FieldError",
        "FieldHint",
        "Form",
        "INPUT_A11Y_CONTRACT",
        "Input",
        "InputGroup",
        "InputGroupText",
        "LABEL_A11Y_CONTRACT",
        "Label",
        "RADIO_GROUP_A11Y_CONTRACT",
        "RadioGroup",
        "RadioGroupItem",
        "SELECT_A11Y_CONTRACT",
        "SLIDER_A11Y_CONTRACT",
        "SWITCH_A11Y_CONTRACT",
        "Select",
        "SelectContent",
        "SelectGroup",
        "SelectItem",
        "SelectItemText",
        "SelectLabel",
        "SelectPortal",
        "SelectSeparator",
        "SelectTrigger",
        "SelectValue",
        "Slider",
        "SliderRange",
        "SliderThumb",
        "SliderTrack",
        "Switch",
        "TEXTAREA_A11Y_CONTRACT",
        "TOGGLE_A11Y_CONTRACT",
        "TOGGLE_GROUP_A11Y_CONTRACT",
        "Textarea",
        "Toggle",
        "ToggleGroup",
        "ToggleGroupItem",
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
  overlays: [
    {
      exports: [
        "ALERT_DIALOG_A11Y_CONTRACT",
        "AlertDialog",
        "AlertDialogAction",
        "AlertDialogCancel",
        "AlertDialogContent",
        "AlertDialogDescription",
        "AlertDialogOverlay",
        "AlertDialogPortal",
        "AlertDialogTitle",
        "AlertDialogTrigger",
        "DIALOG_A11Y_CONTRACT",
        "DROPDOWN_A11Y_CONTRACT",
        "Dialog",
        "DialogClose",
        "DialogContent",
        "DialogDescription",
        "DialogOverlay",
        "DialogPortal",
        "DialogTitle",
        "DialogTrigger",
        "Dropdown",
        "DropdownContent",
        "DropdownGroup",
        "DropdownItem",
        "DropdownLabel",
        "DropdownPortal",
        "DropdownSeparator",
        "DropdownTrigger",
        "HoverCard",
        "HoverCardContent",
        "HoverCardPortal",
        "HoverCardTrigger",
        "MENUBAR_A11Y_CONTRACT",
        "MENU_A11Y_CONTRACT",
        "Menu",
        "MenuContent",
        "MenuGroup",
        "MenuItem",
        "MenuLabel",
        "MenuSeparator",
        "Menubar",
        "MenubarContent",
        "MenubarGroup",
        "MenubarItem",
        "MenubarLabel",
        "MenubarMenu",
        "MenubarPortal",
        "MenubarSeparator",
        "MenubarSub",
        "MenubarSubContent",
        "MenubarSubTrigger",
        "MenubarTrigger",
        "POPOVER_A11Y_CONTRACT",
        "Popover",
        "PopoverClose",
        "PopoverContent",
        "PopoverPortal",
        "PopoverTrigger",
        "TOAST_A11Y_CONTRACT",
        "TOOLTIP_A11Y_CONTRACT",
        "Toast",
        "ToastAction",
        "ToastClose",
        "ToastDescription",
        "ToastProvider",
        "ToastTitle",
        "ToastViewport",
        "Tooltip",
        "TooltipContent",
        "TooltipPortal",
        "TooltipTrigger",
      ],
      directTests: [
        "tests/browser/dialog-theme.test.tsx",
        "tests/jsdom/navbar-link.test.tsx",
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
  ],
  surfaces: [
    {
      exports: [
        "ACCORDION_A11Y_CONTRACT",
        "AVATAR_A11Y_CONTRACT",
        "Accordion",
        "AccordionContent",
        "AccordionHeader",
        "AccordionItem",
        "AccordionTrigger",
        "Alert",
        "AspectRatio",
        "Avatar",
        "AvatarFallback",
        "AvatarImage",
        "Badge",
        "COLLAPSIBLE_A11Y_CONTRACT",
        "Card",
        "CardActions",
        "CardContent",
        "CardDescription",
        "CardFooter",
        "CardHeader",
        "CardTitle",
        "Collapsible",
        "CollapsibleContent",
        "CollapsibleTrigger",
        "Divider",
        "ListGroup",
        "ListGroupItem",
        "PROGRESS_A11Y_CONTRACT",
        "PROGRESS_CIRCLE_A11Y_CONTRACT",
        "Progress",
        "ProgressCircle",
        "ProgressCircleIndicator",
        "ProgressIndicator",
        "SEPARATOR_A11Y_CONTRACT",
        "ScrollArea",
        "ScrollAreaCorner",
        "ScrollAreaScrollbar",
        "ScrollAreaThumb",
        "ScrollAreaViewport",
        "Separator",
        "Skeleton",
        "Spinner",
        "Table",
        "TableBody",
        "TableCaption",
        "TableCell",
        "TableFoot",
        "TableHead",
        "TableHeaderCell",
        "TableRow",
        "VirtualList",
        "VirtualTable",
      ],
      directTests: [
        "tests/browser/table-theme.test.tsx",
        "tests/unit/card-components.test.ts",
        "tests/unit/theme-aliases.test.ts",
        "tests/unit/block-first-components.test.ts",
        "tests/unit/components-entrypoint.test.ts",
        "tests/unit/package-surface.test.ts",
        "tests/jsdom/breadcrumb-spinner.test.tsx",
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
        "tests/browser/theme-route-persistence.test.tsx",
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
  it("should keeps the core family covered by direct tests and composition benches", () => {
    assertCoverage("core", core, [], COVERAGE.core);
  });

  it("should keeps the controls family covered by direct tests and tier2 benches", () => {
    assertCoverage("controls", controls, IGNORED_EXPORTS.controls, COVERAGE.controls);
  });

  it("should keeps the nav family covered by direct tests and the correct bench tiers", () => {
    assertCoverage("navs", navs, IGNORED_EXPORTS.navs, COVERAGE.navs);
  });

  it("should keeps the overlay family covered by direct tests and tier2 benches", () => {
    assertCoverage("overlays", overlays, IGNORED_EXPORTS.overlays, COVERAGE.overlays);
  });

  it("should keeps the surfaces family covered by direct tests and tier2 benches", () => {
    assertCoverage("surfaces", surfaces, IGNORED_EXPORTS.surfaces, COVERAGE.surfaces);
  });

  it("should keeps the theme family covered by direct tests and tier3 benches", () => {
    assertCoverage("theme", theme, IGNORED_EXPORTS.theme, COVERAGE.theme);
  });
});
