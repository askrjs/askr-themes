import { Block, Container, Header, Main, NavGroup, Navbar } from "../../../src/core";
import { ThemeScope, ThemeToggle, type ThemeToggleRenderContext } from "../../../src/theme";
import { mountRoute, settle } from "./_spa";

import "../../../src/themes/default/index.css";

/**
 * Theme toggle content visibility. Both cases boot on `/theme-visibility` with
 * the toggle's own storage key cleared so the scope starts from its declared
 * default theme rather than a previous run's choice.
 */

function clearStoredTheme(): void {
  window.localStorage.removeItem("askr-theme");
  window.localStorage.removeItem("askr-theme-toggle-visibility");
}

const controls = {
  settle: async () => {
    await settle();
    return null;
  },
};

export default async function toggleVisibility(root: HTMLElement): Promise<typeof controls> {
  clearStoredTheme();

  await mountRoute(root, "/theme-visibility", () => (
    <ThemeScope defaultTheme="light" storageKey="askr-theme-toggle-visibility">
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
    </ThemeScope>
  ));

  return controls;
}

/** The same toggle without the surrounding layout chrome. */
export async function iconSizing(root: HTMLElement): Promise<void> {
  clearStoredTheme();

  await mountRoute(root, "/theme-visibility", () => (
    <ThemeScope defaultTheme="light" storageKey="askr-theme-toggle-visibility">
      <Header>
        <Container>
          <Navbar aria-label="Theme visibility">
            <NavGroup align="end">
              <ThemeToggle
                lightIcon={
                  <svg aria-hidden="true" data-icon="sun" data-slot="icon" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="4" />
                  </svg>
                }
                darkIcon={
                  <svg aria-hidden="true" data-icon="moon" data-slot="icon" viewBox="0 0 24 24">
                    <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9z" />
                  </svg>
                }
              />
            </NavGroup>
          </Navbar>
        </Container>
      </Header>
    </ThemeScope>
  ));
}
