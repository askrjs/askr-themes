import { describe, expect, it } from "vite-plus/test";

import {
  Badge,
  Button,
  Card,
  EmptyState,
  FormSection,
  GitHubLogo,
  GoogleLogo,
  Header,
  MicrosoftLogo,
  NavBrand,
  NavGroup,
  NavItem,
  Navbar,
  SettingsSection,
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
  it("exposes styled app-facing components from one barrel", () => {
    expect(typeof Button).toBe("function");
    expect(Stack({ children: "stack", gap: "2" })).toBeTruthy();
    expect(Badge({ children: "new" })).toBeTruthy();
    expect(Card({ children: "body" })).toBeTruthy();
    expect(GitHubLogo({ title: "GitHub" })).toBeTruthy();
    expect(GoogleLogo({ title: "Google" })).toBeTruthy();
    expect(MicrosoftLogo({ title: "Microsoft" })).toBeTruthy();
    expect(Header({ children: "header" })).toBeTruthy();
    expect(Navbar({ children: "nav" })).toBeTruthy();
    expect(NavBrand({ children: "brand" })).toBeTruthy();
    expect(NavGroup({ children: "group" })).toBeTruthy();
    expect(NavItem({ href: "https://github.com/askrjs", children: "item" })).toBeTruthy();
    expect(EmptyState({ title: "No projects" })).toBeTruthy();
    expect(FormSection({ title: "Profile", children: "fields" })).toBeTruthy();
    expect(SettingsSection({ title: "Team", children: "settings" })).toBeTruthy();
  });

  it("exposes theme management helpers", () => {
    expect(typeof ThemeProvider).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
    expect(typeof useTheme).toBe("function");
  });

  it("lets high-level pattern components override heading level", () => {
    const emptyState = asElement(EmptyState({ title: "No projects", titleAs: "h3" }));
    const formSection = asElement(
      FormSection({ title: "Profile", titleAs: "h4", children: "fields" }),
    );
    const settingsSection = asElement(
      SettingsSection({ title: "Team", titleAs: "h5", children: "settings" }),
    );

    expect((emptyState.props.children as ElementLike[])[1].type).toBe("h3");
    expect(
      (
        ((formSection.props.children as ElementLike[])[0].props.children as ElementLike[])[0].props
          .children as ElementLike[]
      )[0].type,
    ).toBe("h4");
    expect(
      ((settingsSection.props.children as ElementLike[])[0].props.children as ElementLike[])[0]
        .type,
    ).toBe("h5");
  });
});
