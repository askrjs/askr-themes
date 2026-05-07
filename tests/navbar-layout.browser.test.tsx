import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavBrand, NavGroup, NavItem, Navbar } from "../src/components";

import "../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

describe("vertical navbar browser regression", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/docs");
    clearRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
  });

  it("keeps sidebar nav groups stacked and styles optional group titles", async () => {
    route("/docs", () => (
      <Navbar orientation="vertical" aria-label="Docs navigation">
        <NavBrand>
          <a href="/">Docs</a>
        </NavBrand>
        <NavGroup id="guides-group" label="Guides">
          <NavItem href="/docs/getting-started">Getting started</NavItem>
          <NavItem href="/docs/components">Components</NavItem>
        </NavGroup>
        <NavGroup placement="bottom">
          <NavItem href="/settings">Settings</NavItem>
        </NavGroup>
      </Navbar>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const navbar = container?.querySelector('[data-slot="navbar"]') as HTMLElement | null;
    const titledGroup = container?.querySelector(
      '[data-slot="navbar-group"][data-has-label="true"]',
    ) as HTMLElement | null;
    const groupLabel = container?.querySelector(
      '[data-slot="navbar-group-label"]',
    ) as HTMLElement | null;
    const groupBody = container?.querySelector(
      '[data-slot="navbar-group-body"]',
    ) as HTMLElement | null;
    const firstItem = container?.querySelector('[data-slot="nav-item"]') as HTMLElement | null;
    const trailingGroup = container?.querySelectorAll('[data-slot="navbar-group"]')[1] as HTMLElement | null;

    expect(navbar?.getAttribute("data-orientation")).toBe("vertical");
    expect(titledGroup?.getAttribute("role")).toBe("group");
    expect(titledGroup?.getAttribute("aria-labelledby")).toBe("guides-group-label");
    expect(groupLabel?.textContent).toBe("Guides");
    expect(groupBody?.children).toHaveLength(2);
    expect(getComputedStyle(navbar!).flexDirection).toBe("column");
    expect(getComputedStyle(titledGroup!).display).toBe("grid");
    expect(getComputedStyle(groupBody!).display).toBe("grid");
    expect(getComputedStyle(groupLabel!).textTransform).toBe("uppercase");
    expect(getComputedStyle(groupLabel!).paddingInlineStart).not.toBe("0px");
    expect(trailingGroup?.getAttribute("data-align")).toBe("end");
    expect(getComputedStyle(firstItem!).justifyContent).toBe("flex-start");
  });
});