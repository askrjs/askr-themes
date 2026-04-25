import { describe, expect, it } from "vite-plus/test";

import { SidebarLayout as HeadlessSidebarLayout } from "@askrjs/askr-ui/patterns/sidebar-layout";
import { TopbarLayout as HeadlessTopbarLayout } from "@askrjs/askr-ui/patterns/topbar-layout";

import { SidebarLayout } from "../src/default/sidebar-layout";
import { TopbarLayout } from "../src/default/topbar-layout";

describe("default themed layout wrappers", () => {
  it("should expose a real sidebar layout wrapper component", () => {
    expect(typeof SidebarLayout).toBe("function");
    expect(SidebarLayout).not.toBe(HeadlessSidebarLayout);
    expect(SidebarLayout({ sidebar: "nav", children: "main" })).toBeTruthy();
  });

  it("should expose a real topbar layout wrapper component", () => {
    expect(typeof TopbarLayout).toBe("function");
    expect(TopbarLayout).not.toBe(HeadlessTopbarLayout);
    expect(TopbarLayout({ topbar: "header", children: "main" })).toBeTruthy();
  });
});
