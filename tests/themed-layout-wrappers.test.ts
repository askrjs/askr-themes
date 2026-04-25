import { describe, expect, it } from "vite-plus/test";

import { SidebarLayout, TopbarLayout } from "../src/components";

describe("default themed layout wrappers", () => {
  it("should expose a real sidebar layout wrapper component", () => {
    expect(typeof SidebarLayout).toBe("function");
    expect(SidebarLayout({ sidebar: "nav", children: "main" })).toBeTruthy();
  });

  it("should expose a real topbar layout wrapper component", () => {
    expect(typeof TopbarLayout).toBe("function");
    expect(TopbarLayout({ topbar: "header", children: "main" })).toBeTruthy();
  });
});
