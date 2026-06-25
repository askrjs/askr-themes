import { describe, expect, it } from "vite-plus/test";

import { Block, Header, Main, Sidebar } from "../../src/core";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("semantic core presets", () => {
  it("should renders Header as a thin sticky Block preset", () => {
    const header = asElement(Header({ sticky: true, class: "header-custom", children: "nav" }));

    expect(header.type).toBe(Block);
    expect(header.props.as).toBe("header");
    expect(header.props["data-slot"]).toBe("header");
    expect(header.props.sticky).toBe(true);
    expect(header.props.top).toBe("0");
    expect(header.props.background).toBe("surface");
    expect(header.props.borderBottom).toBe(true);
    expect(header.props.class).toBe("header-custom");
  });

  it("should renders Main and Sidebar with stable semantic slots", () => {
    const sidebar = asElement(Sidebar({ children: "nav", class: "sidebar-custom" }));
    const main = asElement(Main({ children: "main", class: "main-custom" }));

    expect(sidebar.type).toBe(Block);
    expect(main.type).toBe(Block);
    expect(sidebar.props.as).toBe("aside");
    expect(main.props.as).toBe("main");
    expect(sidebar.props["data-slot"]).toBe("sidebar");
    expect(main.props["data-slot"]).toBe("main");
    expect(sidebar.props.width).toBe("sidebar");
    expect(sidebar.props.shrink).toBe(false);
    expect(sidebar.props.borderRight).toBe(true);
    expect(main.props.grow).toBe(true);
    expect(sidebar.props.class).toBe("sidebar-custom");
    expect(main.props.class).toBe("main-custom");
  });
});
