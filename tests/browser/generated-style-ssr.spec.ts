import type { HydrationGeometry } from "./scenarios/generated-style-ssr";

import { expect, test } from "./fixtures";

test.describe("generated theme style geometry", () => {
  test("should keep a centered max-width Container stable through hydration", async ({
    render,
    run,
  }) => {
    await render();
    const geometry = await run<HydrationGeometry>("geometry");

    expect(Math.round(geometry.beforeWidth)).toBe(1152);
    expect(Math.round(geometry.beforeX - geometry.rootBeforeX)).toBe(124);
    expect(geometry.afterWidth).toBeCloseTo(geometry.beforeWidth, 3);
    expect(geometry.afterX).toBeCloseTo(geometry.beforeX, 3);
    expect(geometry.shiftTotal).toBe(0);
    // The original counted the registry elements; the scenario can only hand
    // back a number, so the length assertion becomes the equivalent equality.
    expect(geometry.registryCount).toBe(1);
  });
});
