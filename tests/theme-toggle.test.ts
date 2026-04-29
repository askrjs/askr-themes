import { describe, expect, it } from "vite-plus/test";

import { resolveThemeToggleIcon } from "../src/components/theme/theme";

describe("ThemeToggle", () => {
  it("falls back to the next theme icon when the current choice is system", () => {
    expect(
      resolveThemeToggleIcon("system", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
      }),
    ).toBe("sun");
  });

  it("prefers the explicit current-theme icon when available", () => {
    expect(
      resolveThemeToggleIcon("dark", "light", {
        lightIcon: "sun",
        darkIcon: "moon",
        systemIcon: "laptop",
      }),
    ).toBe("moon");
  });
});
