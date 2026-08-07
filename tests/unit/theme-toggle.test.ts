import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

import { resolveThemeToggleIcon } from "../../src/components/theme/theme";

describe("ThemeToggle", () => {
  it("should not couple icon cloning to private renderer cache fields", () => {
    const source = readFileSync(
      new URL("../../src/components/theme/theme.tsx", import.meta.url),
      "utf8",
    );

    expect(source).not.toContain("__askrStaticChildSlots");
  });

  it("should fall back to the next theme icon when the current choice is system", () => {
    expect(
      resolveThemeToggleIcon("system", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
      }),
    ).toBe("sun");
  });

  it("should prefer the explicit current-theme icon when available", () => {
    expect(
      resolveThemeToggleIcon("dark", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBe("moon");
  });

  it("should prefer the explicit system icon when available", () => {
    expect(
      resolveThemeToggleIcon("system", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBe("laptop");
  });

  it("should fall back from a missing current icon to the next theme icon", () => {
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

  it("should fall back from a custom current theme to a standard next-theme icon", () => {
    expect(
      resolveThemeToggleIcon("neon", "dark", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBe("moon");
  });
});
