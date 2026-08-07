import { describe, expect, it } from "vite-plus/test";

import { mergeProps } from "../../src/components/_internal/merge-props";

describe("mergeProps", () => {
  it("should compose refs without dropping either target", () => {
    const injectedRef = { current: null as HTMLDivElement | null };
    let baseRefValue: HTMLDivElement | null = null;

    const merged = mergeProps(
      {
        ref: (node: HTMLDivElement | null) => {
          baseRefValue = node;
        },
      },
      { ref: injectedRef },
    );

    const node = {} as HTMLDivElement;
    (merged.ref as (value: HTMLDivElement | null) => void)(node);

    expect(injectedRef.current).toBe(node);
    expect(baseRefValue).toBe(node);
  });

  it("should run injected handlers first and respect preventDefault", () => {
    const calls: string[] = [];
    const event = {
      defaultPrevented: false,
      preventDefault() {
        this.defaultPrevented = true;
      },
    };

    const merged = mergeProps(
      {
        onClick: () => {
          calls.push("base");
        },
      },
      {
        onClick: (input: typeof event) => {
          calls.push("injected");
          input.preventDefault();
        },
      },
    );

    (merged.onClick as (input: typeof event) => void)(event);

    expect(calls).toEqual(["injected"]);
  });

  it("should compose class names instead of dropping defaults", () => {
    const merged = mergeProps(
      {
        class: "my-badge",
      },
      {
        class: "badge badge-success",
      },
    );

    expect(merged.class).toBe("badge badge-success my-badge");
  });

  it("should retain reactive class accessors while composing fixed classes", () => {
    let active = false;
    const merged = mergeProps(
      { class: () => (active ? "active" : "inactive") },
      { class: "button" },
    );

    expect(typeof merged.class).toBe("function");
    const readClass = merged.class as () => string | undefined;
    expect(readClass()).toBe("button inactive");
    active = true;
    expect(readClass()).toBe("button active");
  });
});
