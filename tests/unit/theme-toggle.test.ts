import { describe, expect, it } from "vite-plus/test";

import { resolveThemeToggleIcon } from "../../src/components/theme/theme";

describe("ThemeToggle", () => {
  it("should falls back to the next theme icon when the current choice is system", () => {
    expect(
      resolveThemeToggleIcon("system", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
      }),
    ).toBe("sun");
  });

  it("should prefers the explicit current-theme icon when available", () => {
    expect(
      resolveThemeToggleIcon("dark", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBe("moon");
  });

  it("should prefers the explicit system icon when available", () => {
    expect(
      resolveThemeToggleIcon("system", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBe("laptop");
  });

  it("should falls back from a missing current icon to the next theme icon", () => {
    expect(
      resolveThemeToggleIcon("light", "dark", {
        darkIcon: "moon",
      }),
    ).toBe("moon");
  });

  it("should not invent an icon for custom themes without matching icon props", () => {
    expect(
      resolveThemeToggleIcon("tabby", "ginger", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBeUndefined();
  });

  it("should falls back from a custom current theme to a standard next-theme icon", () => {
    expect(
      resolveThemeToggleIcon("neon", "dark", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBe("moon");
  });
});
