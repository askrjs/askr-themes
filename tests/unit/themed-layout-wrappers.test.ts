import { describe, expect, it } from "vite-plus/test";

import { Shell, ShellMain, ShellNav } from "../../src/shells";

describe("default themed layout wrappers", () => {
  it("should expose a real unified shell component with named parts", () => {
    expect(typeof Shell).toBe("function");
    expect(typeof ShellNav).toBe("function");
    expect(typeof ShellMain).toBe("function");
    expect(
      Shell({
        variant: "sidebar",
        children: [ShellNav({ children: "nav" }), ShellMain({ children: "main" })],
      }),
    ).toBeTruthy();
  });

  it("should expose a real topbar shell variant", () => {
    expect(
      Shell({
        variant: "topbar",
        children: [ShellNav({ children: "header" }), ShellMain({ children: "main" })],
      }),
    ).toBeTruthy();
  });

  it("should expose a real rail shell variant", () => {
    expect(
      Shell({
        variant: "rail",
        children: [ShellNav({ children: "rail" }), ShellMain({ children: "main" })],
      }),
    ).toBeTruthy();
  });
});
