import { describe, expect, it } from "vite-plus/test";

import {
  Badge,
  AppShell,
  Button,
  Card,
  EmptyState,
  FormSection,
  PageHeader,
  SettingsSection,
  Stack,
  ThemePicker,
  ThemeProvider,
  ThemeToggle,
  useTheme,
} from "../src/components";

describe("components entrypoint", () => {
  it("exposes styled app-facing components from one barrel", () => {
    expect(typeof Button).toBe("function");
    expect(Stack({ children: "stack", gap: "2" })).toBeTruthy();
    expect(Badge({ children: "new" })).toBeTruthy();
    expect(Card({ children: "body" })).toBeTruthy();
    expect(AppShell({ children: "app" })).toBeTruthy();
    expect(PageHeader({ title: "Dashboard" })).toBeTruthy();
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
});
