import { describe, expect, it } from "vite-plus/test";

import {
  AccessibleIcon,
  AspectRatio,
  Badge,
  Button,
  Card,
  Breadcrumb,
  EmptyState,
  GitHubLogo,
  GoogleLogo,
  Header,
  MicrosoftLogo,
  NavBrand,
  NavGroup,
  NavItem,
  NavLink,
  Navbar,
  Spinner,
  Stack,
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "../src/components";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("components entrypoint", () => {
  it("exposes theme controls and semantic styling helpers", () => {
    expect(typeof Button).toBe("function");
    expect(typeof ThemeProvider).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
    expect(typeof useTheme).toBe("function");
  });

  it("exposes visual primitives and theme-owned wrappers", () => {
    expect(AspectRatio({ ratio: 16 / 9, children: "hero" })).toBeTruthy();
    expect(AccessibleIcon({ label: "Settings", children: "icon" })).toBeTruthy();
    expect(Stack({ children: "stack", gap: "2" })).toBeTruthy();
    expect(Badge({ children: "new" })).toBeTruthy();
    expect(Card({ children: "body" })).toBeTruthy();
    expect(GitHubLogo({ title: "GitHub" })).toBeTruthy();
    expect(GoogleLogo({ title: "Google" })).toBeTruthy();
    expect(MicrosoftLogo({ title: "Microsoft" })).toBeTruthy();
    expect(Breadcrumb({ children: "trail" })).toBeTruthy();
    expect(Spinner({ label: "Working" })).toBeTruthy();
  });

  it("exposes empty state and shell chrome", () => {
    expect(Header({ children: "header" })).toBeTruthy();
    expect(Navbar({ children: "nav" })).toBeTruthy();
    expect(NavBrand({ children: "brand" })).toBeTruthy();
    expect(NavGroup({ children: "group" })).toBeTruthy();
    expect(NavItem({ href: "https://github.com/askrjs", children: "item" })).toBeTruthy();
    expect(NavLink({ href: "/docs", children: "link" })).toBeTruthy();
    expect(EmptyState({ title: "No projects" })).toBeTruthy();
  });

  it("lets the empty state override heading level", () => {
    const emptyState = asElement(EmptyState({ title: "No projects", titleAs: "h3" }));

    expect((emptyState.props.children as ElementLike[])[1].type).toBe("h3");
  });
});
