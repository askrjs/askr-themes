import { describe, expect, it } from "vite-plus/test";

import {
  Badge,
  Button,
  Card,
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
  });

  it("exposes theme management helpers", () => {
    expect(typeof ThemeProvider).toBe("function");
    expect(typeof ThemePicker).toBe("function");
    expect(typeof ThemeToggle).toBe("function");
    expect(typeof useTheme).toBe("function");
  });
});
