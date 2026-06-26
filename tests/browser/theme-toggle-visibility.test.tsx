import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test";

import { cleanupApp, createSPA } from "@askrjs/askr/boot";
import { clearRoutes, getManifest, route } from "@askrjs/askr/router";

import { Block, Container, Header, Main, NavGroup, Navbar } from "../../src/core";
import { ThemeProvider, ThemeToggle, type ThemeToggleRenderContext } from "../../src/theme";

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
    window.localStorage.removeItem("askr-theme");
    window.localStorage.removeItem("askr-theme-toggle-visibility");
  });

  afterEach(() => {
    if (container) {
      cleanupApp(container);
      container.remove();
      container = undefined;
    }

    clearRoutes();
    window.localStorage.removeItem("askr-theme");
    window.localStorage.removeItem("askr-theme-toggle-visibility");
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.removeAttribute("data-theme-choice");
    document.documentElement.style.removeProperty("--ak-theme-toggle-icon-size");
  });

  it("should keep toggle content visible after switching to dark mode", async () => {
    route("/theme-visibility", () => (
      <ThemeProvider defaultTheme="light" storageKey="askr-theme-toggle-visibility">
        <Header>
          <Container>
            <Block direction="row" align="center" justify="between" paddingY="md">
              <a href="/">
                <strong>Askr</strong>
              </a>
              <Navbar aria-label="Theme visibility">
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
                      <path d="M12 2v2" />
                      <path d="M12 20v2" />
                      <path d="m4.93 4.93 1.41 1.41" />
                      <path d="m17.66 17.66 1.41 1.41" />
                      <path d="M2 12h2" />
                      <path d="M20 12h2" />
                      <path d="m6.34 17.66-1.41 1.41" />
                      <path d="m19.07 4.93-1.41 1.41" />
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
                <ThemeToggle>{({ nextTheme }: ThemeToggleRenderContext) => nextTheme}</ThemeToggle>
              </NavGroup>
              </Navbar>
            </Block>
          </Container>
        </Header>
        <Main>
          <p>Main content</p>
        </Main>
      </ThemeProvider>
    ));

    await createSPA({ root: container!, manifest: getManifest() });
    await settle();

    const toggles = [...(container?.querySelectorAll('[data-theme-control="toggle"]') ?? [])] as [
      HTMLButtonElement,
      HTMLButtonElement,
    ];
    expect(toggles).toHaveLength(2);
    const [iconToggle, textToggle] = toggles;
    const iconContent = iconToggle?.querySelector('[data-slot="theme-toggle-content"]');
    const iconSlots = iconToggle?.querySelectorAll('[data-slot="theme-toggle-icon"]');
    const visibleIconSlot = iconToggle?.querySelector(
      '[data-slot="theme-toggle-icon"]:not([hidden])',
    );
    const icon = visibleIconSlot?.querySelector("svg");

    expect(iconToggle).not.toBeNull();
    expect(textToggle).not.toBeNull();
    expect(icon).not.toBeNull();
    expect(iconContent).not.toBeNull();
    expect(iconSlots).toHaveLength(2);
    expect(iconToggle?.querySelectorAll("svg")).toHaveLength(2);
    expect(visibleIconSlot?.getAttribute("data-theme-toggle-icon")).toBe("light");
    expect(
      iconToggle
        ?.querySelector('[data-theme-toggle-icon="dark"]')
        ?.hasAttribute("hidden"),
    ).toBe(true);
    expect(icon?.getAttribute("data-icon")).toBe("sun");
    expect(icon?.children).toHaveLength(9);
    expect(getComputedStyle(icon as SVGElement).inlineSize).toBe("14px");
    expect(getComputedStyle(icon as SVGElement).blockSize).toBe("14px");
    document.documentElement.style.setProperty("--ak-theme-toggle-icon-size", "22px");
    expect(getComputedStyle(icon as SVGElement).inlineSize).toBe("22px");
    expect(getComputedStyle(icon as SVGElement).blockSize).toBe("22px");
    expect(textToggle?.textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    iconToggle?.click();
    await settle();

    const togglesAfter = [
      ...(container?.querySelectorAll('[data-theme-control="toggle"]') ?? []),
    ] as [HTMLButtonElement, HTMLButtonElement];
    expect(togglesAfter).toHaveLength(2);
    const [iconToggleAfter, textToggleAfter] = togglesAfter;
    const visibleIconSlotAfter = iconToggleAfter?.querySelector(
      '[data-slot="theme-toggle-icon"]:not([hidden])',
    );
    const iconAfter = visibleIconSlotAfter?.querySelector("svg");

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(iconToggleAfter?.getAttribute("data-theme-choice")).toBe("dark");
    expect(iconToggleAfter?.querySelector('[data-slot="theme-toggle-content"]')).not.toBeNull();
    expect(iconToggleAfter?.querySelectorAll("svg")).toHaveLength(2);
    expect(visibleIconSlotAfter?.getAttribute("data-theme-toggle-icon")).toBe("dark");
    expect(
      iconToggleAfter
        ?.querySelector('[data-theme-toggle-icon="light"]')
        ?.hasAttribute("hidden"),
    ).toBe(true);
    expect(iconAfter).not.toBeNull();
    expect(iconAfter?.getAttribute("data-icon")).toBe("moon");
    expect(iconAfter?.children).toHaveLength(1);
    expect(getComputedStyle(iconAfter as SVGElement).inlineSize).toBe("22px");
    expect(getComputedStyle(iconAfter as SVGElement).blockSize).toBe("22px");
    expect(textToggleAfter?.textContent).toBe("light");
    expect(textToggleAfter?.getAttribute("data-theme-choice")).toBe("dark");
    expect(textToggleAfter?.getAttribute("data-next-theme")).toBe("light");

    iconToggleAfter?.click();
    await settle();

    const togglesAgain = [
      ...(container?.querySelectorAll('[data-theme-control="toggle"]') ?? []),
    ] as [HTMLButtonElement, HTMLButtonElement];
    expect(togglesAgain).toHaveLength(2);
    const [iconToggleAgain, textToggleAgain] = togglesAgain;
    const visibleIconSlotAgain = iconToggleAgain?.querySelector(
      '[data-slot="theme-toggle-icon"]:not([hidden])',
    );
    const iconAgain = visibleIconSlotAgain?.querySelector("svg");

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(iconToggleAgain?.getAttribute("data-theme-choice")).toBe("light");
    expect(iconToggleAgain?.querySelector('[data-slot="theme-toggle-content"]')).not.toBeNull();
    expect(iconToggleAgain?.querySelectorAll("svg")).toHaveLength(2);
    expect(visibleIconSlotAgain?.getAttribute("data-theme-toggle-icon")).toBe("light");
    expect(
      iconToggleAgain
        ?.querySelector('[data-theme-toggle-icon="dark"]')
        ?.hasAttribute("hidden"),
    ).toBe(true);
    expect(iconAgain).not.toBeNull();
    expect(iconAgain?.getAttribute("data-icon")).toBe("sun");
    expect(iconAgain?.children).toHaveLength(9);
    expect(getComputedStyle(iconAgain as SVGElement).inlineSize).toBe("22px");
    expect(getComputedStyle(iconAgain as SVGElement).blockSize).toBe("22px");
    expect(textToggleAgain?.textContent).toBe("dark");
    expect(textToggleAgain?.getAttribute("data-theme-choice")).toBe("light");
    expect(textToggleAgain?.getAttribute("data-next-theme")).toBe("dark");
  });
});
