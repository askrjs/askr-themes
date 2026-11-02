import type { JSX } from "@askrjs/askr/jsx-runtime";
import { createIsland } from "@askrjs/askr/boot";
import "../../../src/themes/default/index.css";
import "../../../src/themes/presets/index.css";
import * as components from "../../../src/components";
import { Dropdown, DropdownContent, DropdownTrigger } from "../../../src/overlays";

type ComponentRenderer = (props: Record<string, unknown>) => JSX.Element;

const componentExports = components as unknown as Record<string, unknown>;
const componentCases = [
  { family: "alert", name: "Alert", props: { title: "Status", description: "Ready" } },
  { family: "aside", name: "Aside", props: { children: "Supporting content" } },
  { family: "aspect-ratio", name: "AspectRatio", props: { children: "Image frame" } },
  { family: "badge", name: "Badge", props: { children: "New" } },
  { family: "block", name: "Block", props: { children: "Layout" } },
  { family: "brand", name: "Brand", props: { children: "Askr" } },
  { family: "button-group", name: "ButtonGroup", props: { children: "Actions" } },
  { family: "card", name: "Card", props: { children: "Card body" } },
  { family: "close", name: "Close", props: { label: "Close" } },
  { family: "container", name: "Container", props: { children: "Page content" } },
  { family: "copy-button", name: "CopyButton", props: { label: "Copy value", text: "value" } },
  { family: "empty-state", name: "EmptyState", props: { title: "No results" } },
  { family: "field", name: "Field", props: { children: "Field control" } },
  { family: "footer", name: "Footer", props: { children: "Footer content" } },
  { family: "grid", name: "Grid", props: { children: "Grid item" } },
  { family: "header", name: "Header", props: { children: "Header content" } },
  { family: "heading", name: "Heading", props: { level: 2, children: "Heading" } },
  { family: "input-group", name: "InputGroup", props: { children: "Input" } },
  { family: "intent-layouts", name: "Stack", props: { children: "Stacked content" } },
  { family: "main", name: "Main", props: { children: "Main content" } },
  {
    family: "meta-strip",
    name: "MetaStrip",
    props: { items: [{ label: "Status", value: "Ready" }] },
  },
  { family: "nav", name: "Tabs", props: { children: "Tab links" } },
  { family: "navbar", name: "Navbar", props: { children: "Navigation" } },
  { family: "page", name: "Page", props: { children: "Page content" } },
  { family: "page-header", name: "PageHeader", props: { title: "Page title" } },
  { family: "section", name: "Section", props: { children: "Section content" } },
  { family: "separator", name: "Separator", props: { orientation: "horizontal" } },
  { family: "sidebar", name: "Sidebar", props: { children: "Sidebar content" } },
  { family: "skeleton", name: "Skeleton", props: {} },
  { family: "spinner", name: "Spinner", props: { label: "Loading" } },
  { family: "stat", name: "Stat", props: { children: "42" } },
  { family: "text", name: "Text", props: { children: "Body text" } },
  { family: "toolbar", name: "Toolbar", props: { children: "Toolbar actions" } },
] as const;

function auditComponent(name: string, props: Record<string, unknown>): JSX.Element {
  const Component = componentExports[name] as ComponentRenderer | undefined;
  if (!Component) throw new Error(`Missing public component export: ${name}`);
  return <Component {...props} />;
}

function FamilyMatrix(): JSX.Element {
  return (
    <main id="component-family-matrix">
      {componentCases.map(({ family, name, props }) => (
        <div data-audit-family={family} key={family}>
          {auditComponent(name, props)}
        </div>
      ))}

      <div data-audit-family="command-palette">
        <components.CommandPalette defaultOpen>
          <components.CommandPaletteTrigger>Search</components.CommandPaletteTrigger>
          <components.CommandPaletteContent description="Find a command" title="Commands">
            <components.CommandPaletteList>
              <li>Open settings</li>
            </components.CommandPaletteList>
          </components.CommandPaletteContent>
        </components.CommandPalette>
      </div>

      <div data-audit-family="overlays">
        <Dropdown defaultOpen>
          <DropdownTrigger>Open menu</DropdownTrigger>
          <DropdownContent aria-label="Component audit menu">
            <components.DropdownItem>Settings</components.DropdownItem>
          </DropdownContent>
        </Dropdown>
      </div>

      <div data-audit-family="theme">
        <components.ThemeScope defaultTheme="light">
          <components.ThemePicker label="Theme" />
        </components.ThemeScope>
      </div>
    </main>
  );
}

/** Loads every public component family against the default theme and all presets. */
export default function scopedThemeAudit(root: HTMLElement): void {
  createIsland({ root, component: () => <FamilyMatrix /> });
}
