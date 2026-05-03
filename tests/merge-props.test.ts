import { describe, expect, it } from "vite-plus/test";

import { mergeProps } from "../src/components/_internal/merge-props";

describe("mergeProps", () => {
  it("composes refs without dropping either target", () => {
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

  it("runs injected handlers first and respects preventDefault", () => {
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
});
