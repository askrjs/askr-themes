import { describe, expect, it } from "vite-plus/test";

import { Shell, ShellMain, ShellNav } from "../../src/shells";

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("shell primitive", () => {
  it("should renders an explicit shell root contract", () => {
    const shell = asElement(
      Shell({
        variant: "sidebar",
        class: "shell-custom",
        children: [ShellNav({ children: "nav" }), ShellMain({ children: "main" })],
      }),
    );

    expect(shell.props["data-slot"]).toBe("shell");
    expect(shell.props["data-variant"]).toBe("sidebar");
    expect(shell.props.class).toBe("shell shell-custom");
    expect(shell.props.style).toBeUndefined();
  });

  it("should supports the compact rail shell variant", () => {
    const shell = asElement(
      Shell({
        variant: "rail",
        children: [ShellNav({ children: "nav" }), ShellMain({ children: "main" })],
      }),
    );

    expect(shell.props["data-slot"]).toBe("shell");
    expect(shell.props["data-variant"]).toBe("rail");
    expect(shell.props.class).toBe("shell");
  });

  it("should exposes shell parts with stable slot names", () => {
    const nav = asElement(ShellNav({ children: "nav", class: "shell-nav-custom" }));
    const main = asElement(ShellMain({ children: "main", class: "shell-main-custom" }));

    expect(nav.props["data-slot"]).toBe("shell-nav");
    expect(main.props["data-slot"]).toBe("shell-main");
    expect(nav.props.class).toBe("shell-nav shell-nav-custom");
    expect(main.props.class).toBe("shell-main shell-main-custom");
    expect(main.type).toBe("main");
    expect(nav.props.style).toBeUndefined();
    expect(main.props.style).toBeUndefined();
  });
});
