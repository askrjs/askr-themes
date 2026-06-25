import { describe, expect, it } from "vite-plus/test";

import { Spinner } from "../../src/surfaces";

describe("spinner wrapper", () => {
  it("should renders deterministic spinner element trees", () => {
    const spinnerOne = Spinner({ label: "Syncing" }) as {
      type: unknown;
      props: Record<string, unknown>;
    };
    const spinnerTwo = Spinner({ label: "Syncing" }) as {
      type: unknown;
      props: Record<string, unknown>;
    };

    expect(spinnerOne.type).toBe(spinnerTwo.type);
    expect(spinnerOne.props.value).toBeNull();
    expect(spinnerOne.props["aria-label"]).toBe("Syncing");
    expect(typeof spinnerOne.props.getValueLabel).toBe("function");
    expect(spinnerOne.props.value).toBe(spinnerTwo.props.value);
    expect(spinnerOne.props["aria-label"]).toBe(spinnerTwo.props["aria-label"]);
  });
});
