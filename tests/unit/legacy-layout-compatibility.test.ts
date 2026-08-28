import { afterEach, describe, expect, it, vi } from "vite-plus/test";

type ElementLike = {
  props: Record<string, unknown>;
};

function asElement(value: unknown): ElementLike {
  return value as ElementLike;
}

describe("legacy layout compatibility", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should normalize legacy wrap strings like their boolean equivalents", async () => {
    vi.resetModules();
    const { Inline } = await import("../../src/components/catalog");

    expect(asElement(Inline({ wrap: "wrap" })).props.class).toBe(
      asElement(Inline({ wrap: true })).props.class,
    );
    expect(asElement(Inline({ wrap: "nowrap" })).props.class).toBe(
      asElement(Inline({ wrap: false })).props.class,
    );
  });

  it("should warn once per deprecated component with its replacement", async () => {
    vi.resetModules();
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { Box, Inline, Shell, ShellMain, ShellNav } =
      await import("../../src/components/catalog");

    Box({});
    Box({});
    Inline({});
    Shell({});
    ShellNav({});
    ShellMain({});

    expect(warn).toHaveBeenCalledTimes(5);
    expect(warn.mock.calls.map(([message]) => String(message))).toEqual([
      "[askr-themes] Box is deprecated. Use Block directly.",
      '[askr-themes] Inline is deprecated. Use <Block direction="row">.',
      "[askr-themes] Shell is deprecated. Compose semantic Block primitives instead.",
      '[askr-themes] ShellNav is deprecated. Use <Block as="nav">.',
      '[askr-themes] ShellMain is deprecated. Use <Block as="main" grow>.',
    ]);
  });
});
