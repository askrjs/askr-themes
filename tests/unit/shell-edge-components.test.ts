import { describe, expect, it } from "vite-plus/test";

import { NavToggle, SidebarPanel, SidebarToggle } from "../../src/shells";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("shell edge components", () => {
  it("should renders NavToggle as a stable button contract", () => {
    const toggle = asElement(
      NavToggle({
        active: true,
        label: "Menu",
        open: true,
        panelId: "docs-navbar-panel",
        onToggle: () => undefined,
      }),
    );

    expect(toggle.type).toBe("button");
    expect(toggle.props["data-slot"]).toBe("navbar-toggle");
    expect(toggle.props["data-state"]).toBe("open");
    expect(toggle.props["aria-expanded"]).toBe("true");
    expect(toggle.props["aria-controls"]).toBe("docs-navbar-panel");
    expect(toggle.props["aria-label"]).toBe("Menu");
  });

  it("should returns null when NavToggle is inactive", () => {
    expect(NavToggle({ active: false })).toBeNull();
  });

  it("should returns null for the SidebarToggle marker component", () => {
    expect(
      SidebarToggle({
        collapsedIcon: "collapsed",
        expandedIcon: "expanded",
      }),
    ).toBeNull();
  });

  it("should renders SidebarPanel with the expected shell panel contract", () => {
    const panel = asElement(
      SidebarPanel({
        active: true,
        brand: "Askr",
        children: "Docs",
        collapseLabel: "Docs navigation",
        onClose: () => undefined,
        open: true,
        panelId: "docs-sidebar-panel",
      }),
    );

    expect(panel.type).toBe("div");
    expect(panel.props["data-slot"]).toBe("sidebar-panel");
    expect(panel.props["data-state"]).toBe("open");
    expect(panel.props.role).toBe("dialog");
    expect(panel.props["aria-label"]).toBe("Docs navigation");
    expect(panel.props.id).toBe("docs-sidebar-panel");
  });
});
