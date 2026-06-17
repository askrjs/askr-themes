import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { NavBrand, NavGroup, Navbar } from "../../src/navs";
import { Shell, ShellMain, ShellNav } from "../../src/shells";
import { ThemeProvider, ThemeToggle } from "../../src/theme";

import "../../src/themes/default/index.css";

async function settle(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("theme toggle visibility", () => {
  let container: HTMLDivElement | undefined;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.history.replaceState({}, "", "/theme-visibility");
    clearRoutes();
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
  });

  it("should keep toggle content visible after switching to dark mode", async () => {
    route("/theme-visibility", () => (
      <ThemeProvider defaultTheme="light">
        <Shell variant="topbar">
          <ShellNav>
            <Navbar aria-label="Theme visibility">
              <NavBrand>
                <a href="/">
                  <strong>Askr</strong>
                </a>
              </NavBrand>
              <NavGroup align="end">
                <ThemeToggle
                  lightIcon={
                    <svg
                      aria-hidden="true"
                      data-icon="sun"
                      data-slot="icon"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <circle cx="12" cy="12" r="5" />
                    </svg>
                  }
                  darkIcon={
                    <svg
                      aria-hidden="true"
                      data-icon="moon"
                      data-slot="icon"
                      fill="none"
                      height="24"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M15 4a7 7 0 1 0 5 12A7 7 0 0 1 15 4Z" />
                    </svg>
                  }
                />
                <ThemeToggle>{({ nextTheme }) => nextTheme}</ThemeToggle>
              </NavGroup>
            </Navbar>
          </ShellNav>
          <ShellMain>
            <p>Shell content</p>
          </ShellMain>
        </Shell>
      </ThemeProvider>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const toggles = [
      ...(container?.querySelectorAll('[data-theme-control="toggle"]') ?? []),
    ] as HTMLButtonElement[];
    const iconToggle = toggles[0];
    const textToggle = toggles[1];
    const iconContent = iconToggle?.querySelector('[data-slot="theme-toggle-content"]');
    const icon = iconToggle?.querySelector("svg") as SVGElement | null;

    expect(iconToggle).not.toBeNull();
    expect(textToggle).not.toBeNull();
    expect(iconContent).not.toBeNull();
    expect(iconToggle?.querySelectorAll("svg")).toHaveLength(1);
    expect(icon?.getAttribute("data-icon")).toBe("sun");
    expect(getComputedStyle(icon!).inlineSize).toBe("14px");
    expect(getComputedStyle(icon!).blockSize).toBe("14px");
    expect(textToggle?.textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    iconToggle?.click();
    await settle();

    const togglesAfter = [
      ...(container?.querySelectorAll('[data-theme-control="toggle"]') ?? []),
    ] as HTMLButtonElement[];
    const iconToggleAfter = togglesAfter[0];
    const textToggleAfter = togglesAfter[1];
    const iconAfter = iconToggleAfter?.querySelector("svg") as SVGElement | null;

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(iconToggleAfter?.getAttribute("data-theme-choice")).toBe("dark");
    expect(iconToggleAfter?.querySelector('[data-slot="theme-toggle-content"]')).not.toBeNull();
    expect(iconToggleAfter?.querySelectorAll("svg")).toHaveLength(1);
    expect(iconAfter?.getAttribute("data-icon")).toBe("moon");
    expect(getComputedStyle(iconAfter!).inlineSize).toBe("14px");
    expect(getComputedStyle(iconAfter!).blockSize).toBe("14px");
    expect(textToggleAfter?.textContent).toBe("light");
    expect(textToggleAfter?.getAttribute("data-theme-choice")).toBe("dark");
    expect(textToggleAfter?.getAttribute("data-next-theme")).toBe("light");
  });
});
